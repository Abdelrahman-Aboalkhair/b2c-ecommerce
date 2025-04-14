import prisma from "@/infra/database/database.config";
import { CartRepository } from "@/modules/cart/cart.repository";
import { CartService } from "@/modules/cart/cart.service";
import { cookieOptions } from "@/shared/constants";
import passport from "passport";

const cartRepo = new CartRepository();
const cartService = new CartService(cartRepo);

type OAuthProvider = "googleId" | "facebookId" | "twitterId";

async function findOrCreateUser(
  providerIdField: OAuthProvider,
  providerId: string,
  email: string,
  name: string,
  avatar: string
) {
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    if (!user[providerIdField as keyof typeof user]) {
      user = await prisma.user.update({
        where: { email },
        data: {
          [providerIdField as keyof typeof user]: providerId,
          avatar,
          emailVerified: true,
        },
      });
    }

    return user;
  }

  user = await prisma.user.create({
    data: {
      email,
      name,
      [providerIdField]: providerId,
      emailVerified: true,
      avatar,
    },
  });

  return user;
}

export const oauthCallback = async (
  providerIdField: OAuthProvider,
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: (error: any, user?: any) => void
) => {
  try {
    let user;

    if (providerIdField === "googleId") {
      user = await findOrCreateUser(
        providerIdField,
        profile.id,
        profile.emails[0].value,
        profile.displayName,
        profile.photos[0]?.value || ""
      );
    }

    if (providerIdField === "facebookId") {
      user = await findOrCreateUser(
        providerIdField,
        profile.id,
        profile.emails[0]?.value || "",
        `${profile.name?.givenName} ${profile.name?.familyName}`,
        profile.photos?.[0]?.value || ""
      );
    }

    if (providerIdField === "twitterId") {
      user = await findOrCreateUser(
        providerIdField,
        profile.id,
        profile.emails?.[0]?.value || "",
        profile.displayName || profile.username || "",
        profile.photos?.[0]?.value || ""
      );
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
};

export const handleSocialLogin = (provider: string) => {
  return passport.authenticate(provider, {
    session: false,
    scope: ["email", "profile"],
  });
};

export const handleSocialLoginCallback = (provider: string) => {
  return (
    passport.authenticate(provider, {
      session: false,
      failureRedirect: "http://localhost:3000/sign-in",
    }),
    async (req: any, res: any) => {
      const user = req.user as any;
      const { accessToken, refreshToken } = user;

      res.cookie("refreshToken", refreshToken, cookieOptions);
      res.cookie("accessToken", accessToken, cookieOptions);

      const userId = user.id;
      const sessionId = req.session.id;
      await cartService?.mergeCartsOnLogin(sessionId, userId);

      res.redirect("http://localhost:3000");
    }
  );
};

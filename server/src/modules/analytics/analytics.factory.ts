// analytics.factory.ts
import { AnalyticsRepository } from "./analytics.repository";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsController } from "./analytics.controller";
import { ProductRepository } from "../product/product.repository";
import { ExportUtils } from "@/shared/utils/exportUtils";

export const makeAnalyticsController = () => {
  const analyticsRepo = new AnalyticsRepository();
  const productRepo = new ProductRepository();
  const service = new AnalyticsService(analyticsRepo, productRepo);
  const exportUtils = new ExportUtils();
  return new AnalyticsController(service, exportUtils);
};

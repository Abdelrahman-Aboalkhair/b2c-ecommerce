"use client";
import { ArrowLeft, AlertCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import ProductHeader from "../ProductHeader";
import ProductSummary from "../ProductSummary";
import ProductEditForm from "../ProductEditForm";
import ConfirmModal from "@/app/components/organisms/ConfirmModal";
import { useProductDetail } from "@/app/hooks/miscellaneous/useProductDetails";

const ProductDetailPage = () => {
  const {
    product,
    categories,
    productsLoading,
    categoriesLoading,
    productsError,
    form,
    isUpdating,
    isDeleting,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    onSubmit,
    handleDelete,
    router,
  } = useProductDetail();

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-teal-600 border-r-teal-200 border-b-teal-200 border-l-teal-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">
          Loading product details...
        </p>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <XCircle size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Product
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t retrieve the product information. Please try again
            later.
          </p>
          <button
            onClick={() => router.push("/dashboard/products")}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Return to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The product with ID: {id} could not be found.
          </p>
          <button
            onClick={() => router.push("/dashboard/products")}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Return to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push("/dashboard/products")}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Products</span>
          </button>
        </motion.div>

        <ProductHeader
          product={product}
          isDeleting={isDeleting}
          onDelete={() => setIsConfirmModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProductSummary
              product={product}
              categories={categories}
              isUpdating={isUpdating}
              onSave={() => form.handleSubmit(onSubmit)()}
            />
          </div>

          <div className="lg:col-span-2">
            <ProductEditForm
              form={form}
              onSubmit={onSubmit}
              categories={categories}
              isUpdating={isUpdating}
            />
          </div>
        </div>

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;

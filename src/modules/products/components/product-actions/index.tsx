import {
  ProductProvider,
  useProductActions,
} from "@lib/context/product-context"
import useProductPrice from "@lib/hooks/use-product-price"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/option-select"
import clsx from "clsx"
import React, { useEffect, useMemo } from "react"
import { Toaster, toast } from "sonner"

type ProductActionsProps = {
  product: PricedProduct,
  onVariantChange?: (variant: any) => void;
}

const ProductActionsInner: React.FC<ProductActionsProps> = ({ product, onVariantChange }) => {
  const { updateOptions, addToCart, options, inStock, variant } =
    useProductActions()

  // useEffect that call onVariantChange when variant changes
  useEffect(() => {
    // test if onVariantChange is a function
    // to make sur we change thumbnail only when variant changes on product-preview-home
    if (typeof onVariantChange !== "function") {
      return;
    }
    onVariantChange(variant);
  }, [variant])

  const price = useProductPrice({ id: product.id!, variantId: variant?.id })

  const selectedPrice = useMemo(() => {
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  return (
    <div className="flex flex-col gap-y-2">
      <div>
        {product.variants.length > 1 && (
          <div className="flex flex-col gap-y-4">
            {(product.options || []).map((option) => {
              return (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.id]}
                    updateOption={updateOptions}
                    title={option.title}
                  />
                </div>
              )
            })}
            <Divider />
          </div>
        )}
      </div>

      {selectedPrice ? (
        <div className="flex flex-col text-ui-fg-base">
          <span
            className={clsx("text-xl-semi", {
              "text-rose-600": selectedPrice.price_type === "sale",
            })}
          >
            {selectedPrice.calculated_price}
          </span>
          {selectedPrice.price_type === "sale" && (
            <>
              <p>
                <span className="text-ui-fg-subtle">Original: </span>
                <span className="line-through">
                  {selectedPrice.original_price}
                </span>
              </p>
              <span className="text-ui-fg-interactive">
                -{selectedPrice.percentage_diff}%
              </span>
            </>
          )}
        </div>
      ) : (
        <div></div>
      )}

      <Button
        onClick={addToCart}
        disabled={!inStock || !variant}
        variant="primary"
        className="w-full h-10"
      >
        {!inStock
          ? "Out of stock"
          : !variant
          ? "Select variant"
          : "Add to cart"}
      </Button>
    </div>
  )
}

const ProductActions: React.FC<ProductActionsProps> = ({ product, onVariantChange }) => (
  <ProductProvider product={product}>
    <ProductActionsInner product={product} onVariantChange={onVariantChange} />
  </ProductProvider>
)

export default ProductActions

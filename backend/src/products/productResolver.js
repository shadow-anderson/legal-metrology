const supabase = require("../db/supabase");

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const resolveProduct = async (aiOutput) => {
  const product = aiOutput?.product;

  if (!product?.name?.value || !product?.category?.value) {
    throw new Error("AI product name and category are required");
  }

  const name = product.name.value.trim();
  const category = product.category.value.trim();

  const brandName = product?.brandName?.value || null;
  const commodityCode = product?.commodityCode?.value || null;

  // Search existing products by name
  const { data: existingProducts, error: searchError } = await supabase
    .from("products")
    .select("id, name, category, commodity_code, brand_name")
    .ilike("name", name);

  if (searchError) {
    throw new Error(`Product search failed: ${searchError.message}`);
  }

  const normalizedName = normalize(name);
  const normalizedCategory = normalize(category);
  const normalizedBrand = normalize(brandName);

  const existingProduct = (existingProducts || []).find((p) => {
    const sameName = normalize(p.name) === normalizedName;
    const sameCategory = normalize(p.category) === normalizedCategory;

    const sameBrand =
      !brandName ||
      !p.brand_name ||
      normalize(p.brand_name) === normalizedBrand;

    return sameName && sameCategory && sameBrand;
  });

  // Existing product found
  if (existingProduct) {
    return {
      productId: existingProduct.id,
      created: false,
      product: existingProduct
    };
  }

  // Product does not exist → create it
  const { data: newProduct, error: createError } = await supabase
    .from("products")
    .insert({
      name,
      category,
      commodity_code: commodityCode,
      brand_name: brandName
    })
    .select("id, name, category, commodity_code, brand_name")
    .single();

  if (createError) {
    throw new Error(`Product creation failed: ${createError.message}`);
  }

  return {
    productId: newProduct.id,
    created: true,
    product: newProduct
  };
};

module.exports = { resolveProduct };
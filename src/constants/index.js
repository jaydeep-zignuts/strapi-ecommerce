const Messages = {
  required: "Email address and password fields are required",
  register: "User is not registered with this email address",
  emailPassword: "The Email Address and password do not match",
  enable: "User is not active",
  blocked: "Your account has been blocked by an administrator",
  field: "All fields are required",
  category: "Category already exists",
  categoryNot: "category not exists",
  subcategory: "subcategory already exist",
  subcategoryNot: "subcategory not exists",
  product: "product already exist",
  productNot: "product not exists",
  user: "user not available",
  like: "You already like this product",
  likeNot: "No liked product found",
  notLiked: "YOu not like product yet",
  cart: "Already added to cart",
  cartNot: "Your cart is empty",
  qty: "Please add qty below ",
  rmCart: "requested item is not in cart ",
  order: "Your order list is empty",
  character: "You've reached the maximum character limit in the",
};
const validation = {
  regex: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^])[A-Za-z\\d@$!%*?&]",
  // Exactly 10 digits (e.g., 1234567890)
  // 10 digit number with optional dashes, spaces, or dots after every 3 digits (e.g., 123-4560-789)
  contactNo: "^\\d{3}[-. ]?\\d{3}[-. ]?\\d{4}$",
};
module.exports = {
  Messages,
  validation,
};

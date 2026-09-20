import { logout } from './logout.js'
import { checkAuth, renderGreeting, showHideMenuItems } from './authUI.js'
import { getProducts, populateGenreSelect } from './productService.js'
import { renderProducts } from './productUI.js'
import { updateCartIcon } from './cartService.js'

document.getElementById('logout-btn').addEventListener('click', logout)

// ===== Initial Load =====

async function init() {
  populateGenreSelect()
  const products = await getProducts()
  const name = await checkAuth()
  renderGreeting(name)
  renderProducts(products)
  showHideMenuItems(name)
  if (name) {
    await updateCartIcon()
  }
}

init()


// ===== Event Listeners =====

// دالة التعامل مع البحث وإرسال الطلب للـ Backend
async function handleSearch() {
  const searchTerm = document.getElementById('search-input').value.trim()
  const products = await getProducts(searchTerm ? { search: searchTerm } : {})
  renderProducts(products)
}

// البحث أونلاين أثناء الكتابة في خانة البحث
document.getElementById('search-input').addEventListener('input', handleSearch)

// منع إعادة تحميل الصفحة عند الضغط على Enter وإجراء البحث
document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault()
  handleSearch()
})

// فلترة المنتجات حسب النوع (Genre)
document.getElementById('genre-select').addEventListener('change', async (e) => {
  const genre = e.target.value
  const products = await getProducts(genre ? { genre } : {})
  renderProducts(products)
})
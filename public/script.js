// 初始化 Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCh0RQi1sV49ccPn_c3t7_XuqdeARYO6hs",
  authDomain: "eat-what-fd09f.firebaseapp.com",
  projectId: "eat-what-fd09f",
  storageBucket: "eat-what-fd09f.firebasestorage.app",
  messagingSenderId: "224443894293",
  appId: "1:224443894293:web:ad3d3126760b5592861c1c",
  measurementId: "G-1VQTGCJHGS",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const restaurantsRef = database.ref("restaurants");

let selectedCategory = null; // 選擇的餐點類別

// 選擇餐點類別
document.getElementById("breakfastButton").addEventListener("click", () => {
  selectedCategory = "早餐";
  showActionSection();
  clearDisplayedRestaurant(); // 清空顯示的隨機餐廳
  clearRestaurantList(); // 清空餐廳清單
});

document.getElementById("dinnerButton").addEventListener("click", () => {
  selectedCategory = "晚餐";
  showActionSection();
  clearDisplayedRestaurant(); // 清空顯示的隨機餐廳
  clearRestaurantList(); // 清空餐廳清單
});

// 列出餐廳
document
  .getElementById("listRestaurantsButton")
  .addEventListener("click", () => {
    listRestaurants(selectedCategory);
  });

// 清空顯示的隨機餐廳資料
function clearDisplayedRestaurant() {
  document.getElementById("restaurantName").textContent = ""; // 清空餐廳名稱
  document.getElementById("restaurantCategory").textContent = ""; // 清空餐廳分類
}

// 清空餐廳清單
function clearRestaurantList() {
  const listContainer = document.getElementById("restaurantsList");
  listContainer.innerHTML = ""; // 清空現有的餐廳清單
}

function showActionSection() {
  document.getElementById("actionSection").classList.remove("d-none");
}

// 隨機選擇餐點
document.getElementById("randomButton").addEventListener("click", () => {
  restaurantsRef.once("value", (snapshot) => {
    const restaurants = snapshot.val();
    if (restaurants) {
      const filteredRestaurants = Object.values(restaurants).filter(
        (restaurant) => restaurant.category.includes(selectedCategory)
      );

      if (filteredRestaurants.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * filteredRestaurants.length
        );
        const restaurant = filteredRestaurants[randomIndex];

        // 更新顯示餐廳名稱為超連結
        const restaurantNameElement = document.getElementById("restaurantName");
        const mapLink = restaurant.googleMap;

        // 設置名稱為超連結，點擊後打開 Google Map
        restaurantNameElement.innerHTML = `<a href="${mapLink}" target="_blank">${restaurant.name}</a>`;

        // 顯示其他資訊
        document.getElementById(
          "restaurantCategory"
        ).textContent = `分類：${restaurant.category}`;
      } else {
        alert(`沒有符合的 ${selectedCategory} 店家資料！`);
      }
    } else {
      alert("目前沒有店家資料！");
    }
  });
});

// 列出餐廳清單
function listRestaurants(category) {
  restaurantsRef.once("value", (snapshot) => {
    const restaurants = snapshot.val();

    const listContainer = document.getElementById("restaurantsList");
    listContainer.innerHTML = ""; // 清空現有清單

    if (restaurants) {
      // 過濾資料：將 category 包含在陣列中的餐廳過濾出來
      const filteredRestaurants = Object.values(restaurants).filter(
        (restaurant) => restaurant.category.includes(category)
      );

      if (filteredRestaurants.length > 0) {
        filteredRestaurants.forEach((restaurant) => {
          const link = document.createElement("a");
          link.href = restaurant.googleMap;
          link.target = "_blank";
          link.classList.add("btn", "btn-link");
          link.textContent = restaurant.name;
          const listItem = document.createElement("p");
          listItem.appendChild(link);
          listContainer.appendChild(listItem);
        });
      } else {
        listContainer.innerHTML = "<p>目前沒有該類別的餐廳。</p>";
      }
    } else {
      listContainer.innerHTML = "<p>目前沒有餐廳資料。</p>";
    }
  });
}

// 顯示餐廳詳細資訊
function displayRestaurant(restaurant) {
  document.getElementById("restaurantName").textContent = restaurant.name;
  document.getElementById("restaurantCategory").textContent =
    "分類: " + restaurant.category;
}

// 新增店家（判斷 Google Map 連結是否重複）
document.getElementById("addRestaurantForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value.split(","); // 將分類轉為陣列
  const googleMap = document.getElementById("googleMap").value;

  // 先檢查 Google Map 連結是否已存在
  restaurantsRef.once("value", (snapshot) => {
    const restaurants = snapshot.val();
    const isDuplicate = restaurants
      ? Object.values(restaurants).some(
          (restaurant) => restaurant.googleMap === googleMap
        )
      : false;

    if (isDuplicate) {
      alert("此 Google Map 連結已存在，請勿重複新增！");
    } else {
      // 若無重複，新增資料
      restaurantsRef
        .push({ name, category, googleMap })
        .then(() => {
          alert("新增成功！");
          document.getElementById("addRestaurantForm").reset();
          const modal = document.getElementById("addRestaurantModal");
          const modalInstance = bootstrap.Modal.getInstance(modal);
          modalInstance.hide();
        })
        .catch((error) => {
          alert("新增失敗：" + error.message);
        });
    }
  });
});

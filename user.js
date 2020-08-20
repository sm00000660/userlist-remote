const BASE_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users";
const INDEX_URL = BASE_URL + "/";

const users = []; // 總使用者清單

let filteredUsers = [];

let USERS_PER_PAGE = 12;

let usersGender = [];

let nowPage = 1;
let mode = "card";

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#Search-input");
const paginator = document.querySelector("#paginator");
const changeMode = document.querySelector("#change-mode");
const showItemFormControlSelect = document.querySelector(
  "#itemFormControlSelect"
);
const filterSelect = document.querySelector("#filter");

function renderUserList(data) {
  let rawHTML = "";
  // title, image
  data.forEach((item) => {
    rawHTML += `
      <div class="col-2">
        <div class="mb-2">
          <div class="card">
            <img
              src="${item.avatar}"
              class="card-img-top" alt="User Poster">
            <div class="card-body">
              <h9 class="card-title">${item.name} ${item.surname}</h9>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-user" data-toggle="modal"
                data-target="#user-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE);
  //製作 template
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

// 使用者可以輸入選擇一頁要顯示的清單數,流程 USERS_PER_PAGE 為變數,設定一個輸入欄,收入使用者的輸入資訊,設定監聽事件,將使用者輸入的內容回傳到 USERS_PER_PAGE , 重新render畫面
// 使用者顯示筆數
function showItemSelect(event) {
  USERS_PER_PAGE = event.target.value;
}

showItemFormControlSelect.addEventListener("change", function (event) {
  USERS_PER_PAGE = event.target.value;
  renderPaginator(users.length);
  renderUserList(getUsersByPage(1));
});

// 使用者可以根據「gender / region」來篩選符合條件的清單 : 在serch bar中加入其他選擇清單, 使用者可以選擇條件後,設置監聽器將使用者輸入資料傳入(on click),透過不同function 去比對原始資料, 將比對後的資料傳入下一個function繼續比對,最後render畫面

// 每一個funtion傳入2種資料, 1.使用者輸入的資料:ex名字(字串)性別(f or m)地區... 2.上一個function處理完後的使用者資料(filter後的users)result,如果使用者沒輸入則進入下一個function,最後render畫面

function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users;
  const startIndex = (page - 1) * USERS_PER_PAGE;
  return data.slice(startIndex, startIndex + USERS_PER_PAGE);
}

function showUserModal(id) {
  const modalTitle = document.querySelector("#user-modal-title");
  const modalImage = document.querySelector("#user-modal-image");
  const modalDetails = document.querySelector("#user-modal-details");
  axios.get(INDEX_URL + id).then((response) => {
    // console.log(response)
    const data = response.data;
    modalTitle.innerText = data.name + " " + data.surname;
    modalImage.innerHTML = `<img src="${data.avatar}" alt="movie-poster" class="img-fluid">`;
    modalDetails.innerHTML = `<i class="fas fa-envelope email"> Email : ${data.email}</i>
          <i class="fas fa-venus-mars gender"> Gender : ${data.gender}</i>
          <i class="fab fa-pagelines age"> Age : ${data.age}</i>
          <i class="fas fa-globe-asia region"> Region : ${data.region}</i>
          <i class="fas fa-birthday-cake birthday"> Birthday : ${data.birthday}</i>`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
  const user = users.find((user) => user.id === id);
  if (list.some((user) => user.id === id)) {
    return alert("此使用者已經在收藏清單中!");
  }
  list.push(user);
  localStorage.setItem("favoriteUsers", JSON.stringify(list));
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-user")) {
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// 新增搜尋使用者功能
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(keyword) ||
      user.surname.toLowerCase().includes(keyword)
  );
  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字: ${keyword}, 沒有符合條件的使用者`);
  }
  renderPaginator(filteredUsers.length);
  renderUserList(getUsersByPage(1));
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page);
  //更新畫面
  renderUserList(getUsersByPage(page));
});

// filter list

// add
// 監聽模式切換事件
changeMode.addEventListener("click", function onChangeModeClicked(event) {
  if (event.target.matches("#cardMode")) {
    mode = "card";
  } else if (event.target.matches("#listMode")) {
    mode = "list";
  }
  displayDataList();
});

// Function

// 依照mode不同渲染不同樣式
function displayDataList() {
  const userList = getUsersByPage(nowPage);
  mode === "card"
    ? renderUserListCardMode(userList)
    : renderUserListListMode(userList);
}

function renderUserListCardMode(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
      <div class="col-2">
        <div class="mb-2">
          <div class="card">
            <img
              src="${item.avatar}"
              class="card-img-top" alt="User Poster">
            <div class="card-body">
              <h7 class="card-title">${item.name}</h7>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-user" data-toggle="modal"
                data-target="#user-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

function renderUserListListMode(data) {
  let rawHTML = "";
  rawHTML += '<table class="table"><tbody>';
  data.forEach((item) => {
    rawHTML += `
        <tr>
          <td>
              <h5 class="card-title">${item.name} ${item.surname}</h5>
          </td>
          <td>
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </td>
        </tr>
    `;
  });
  rawHTML += "</tbody></table>";
  dataPanel.innerHTML = rawHTML;
}

axios
  .get(BASE_URL)
  .then((response) => {
    console.log(response);
    users.push(...response.data.results);
    renderPaginator(users.length);
    renderUserList(getUsersByPage(1));
  })
  .catch((error) => console.log(error));

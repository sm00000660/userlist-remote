const BASE_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users";
const INDEX_URL = BASE_URL + "/";

const users = JSON.parse(localStorage.getItem("favoriteUsers")); // 總使用者清單

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#Search-input");

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
              <h7 class="card-title">${item.name}</h7>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-user" data-toggle="modal"
                data-target="#user-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

function removeFromFavorite(id) {
  if (!users) return;
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) return;
  users.splice(userIndex, 1);
  localStorage.setItem("favoriteUsers", JSON.stringify(users));
  renderUserList(users);
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-user")) {
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id));
  }
});

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

renderUserList(users);

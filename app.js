// Получаем элементы HTML по их id
const loadBtn = document.getElementById("loadBtn");
const createBtn = document.getElementById("createBtn");
const postsContainer = document.getElementById("posts");
const postForm = document.getElementById("postForm");
const titleInput = document.getElementById("title");
const bodyInput = document.getElementById("body");
const message = document.getElementById("message");

// Функция отображает сообщения и меняет их класс в зависимости от результата.
function showMessage(text, type = "") {
  message.textContent = text;
  message.className = type;
}

// Функция создаёт HTML-элемент для одной публикации и добавляет его на страницу.
function displayPost(post) {
  const article = document.createElement("article");
  article.className = "post";
  const heading = document.createElement("h3");
  heading.textContent = post.title;
  const paragraph = document.createElement("p");
  paragraph.textContent = post.body;
  article.append(heading, paragraph);
  postsContainer.appendChild(article);
}

// Асинхронный GET-запрос и дожидаться ответа сервера.
async function loadPosts() {
  loadBtn.disabled = true;
  showMessage("Загрузка публикаций...");
  try {
    // fetch отправляет GET-запрос по указанному адресу и получает ответ сервера.
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=5",
    );
    // response.ok проверяет, успешен ли HTTP-ответ.
    if (!response.ok) {
      throw new Error("Не удалось загрузить публикации.");
    }
    // response.json() преобразует полученный JSON в JavaScript-массив.
    const posts = await response.json();
    // Очищаем старый список,чтобы не дублировать публикации.
    postsContainer.replaceChildren();
    // Перебираем массив публикаций и отображаем каждую через DOM.
    posts.forEach(displayPost);
    showMessage("Публикации успешно загружены.", "success");
  } catch (error) {
    // catch обрабатывает сетевые ошибки и ошибки неуспешных HTTP-ответов.
    showMessage("Ошибка: " + error.message, "error");
  } finally {
    // finally выполняется в любом случае. Кнопка снова становится доступной для повторного запроса.
    loadBtn.disabled = false;
  }
}

// addEventListener отслеживает нажатие на кнопку и запускает функцию загрузки публикаций.
loadBtn.addEventListener("click", loadPosts);

// submit обрабатывает отправку формы. preventDefault отменяет стандартную перезагрузку страницы.
postForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  // trim удаляет пробелы по краям строки,поэтому можно проверить, что поля действительно заполнены.
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (title === "" || body === "") {
    showMessage("Заполните заголовок и текст публикации.", "error");
    return;
  }
  createBtn.disabled = true;
  showMessage("Отправка публикации...");
  try {
    // fetch отправляет POST-запрос с данными публикации в формате JSON.
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      // Заголовок сообщает серверу, что отправляемые данные имеют формат JSON.
      headers: {
        "Content-Type": "application/json",
      },
      // JSON.stringify преобразует объект JavaScript в строку JSON.
      body: JSON.stringify({
        title: title,
        body: body,
        userId: 1,
      }),
    });
    // Проверяем успешность POST-запроса.
    if (!response.ok) {
      throw new Error("Не удалось создать публикацию.");
    }
    // Получаем объект с созданной публикацией и её id из ответа сервера.
    const newPost = await response.json();
    // Отображаем созданную публикацию на странице без её перезагрузки.
    displayPost(newPost);
    showMessage(
      `Публикация "${newPost.title}" успешно создана. ID: ${newPost.id}`,
      "success",
    );
    // После успешной отправки очищаем поля формы.
    postForm.reset();
  } catch (error) {
    // Показываем понятное сообщение, если произошла ошибка при отправке.
    showMessage("Ошибка: " + error.message, "error");
  } finally {
    // Возвращаем активность кнопки, чтобы пользователь мог повторить отправку.
    createBtn.disabled = false;
  }
});

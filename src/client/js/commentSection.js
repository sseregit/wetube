const video = document.querySelector("video");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll(".deleteBtn");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const videoComment = document.createElement("li");
  const div = document.createElement("div");
  const icon = document.createElement("i");
  const span = document.createElement("p");
  const btn = document.createElement("button");
  icon.classList.add("fas", "fa-comment");
  videoComment.classList.add("video__comment");
  videoComment.dataset.id = id;
  span.innerText = ` ${text}`;
  btn.innerText = `❌`;
  btn.id = "delteBtn";
  btn.addEventListener("click", handleDelete);
  div.appendChild(icon);
  div.appendChild(span);
  videoComment.appendChild(div);
  videoComment.appendChild(btn);
  videoComments.prepend(videoComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = video.dataset.id;
  if (text.trim() === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text }),
  });
  if (response.status === 201) {
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
    textarea.value = "";
  }
};

const handleDelete = async (event) => {
  const li = event.target.parentElement;
  const commentId = li.dataset.id;
  const response = await fetch(`/api/comments/${commentId}/delete`, {
    method: "DELETE",
  });
  if (response.status === 404) {
    return window.location.reload();
  }
  li.remove();
};

if (form) {
  form.addEventListener("submit", handleSubmit);
  for (let i = 0; i < deleteBtn.length; i++)
    deleteBtn[i].addEventListener("click", handleDelete);
}

function addItem() {
  const input = document.getElementById("itemInput");
  const category = document.getElementById("category").value;
  const newItem = input.value.trim();

  if (newItem === "") return;

  const li = document.createElement("li");
  li.textContent = newItem;

  if (category === "anime") {
    document.getElementById("anime-list").appendChild(li);
  } else {
    document.getElementById("manga-list").appendChild(li);
  }

  input.value = "";
}

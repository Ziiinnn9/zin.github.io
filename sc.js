(() => {
    // Utility to create star SVG icon
    function createStarSVG(color = "#ffb400") {
      const svgNS = "http://www.w3.org/2000/svg";
      const star = document.createElementNS(svgNS, "svg");
      star.setAttribute("class", "star");
      star.setAttribute("viewBox", "0 0 24 24");
      star.setAttribute("aria-hidden", "true");
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute(
        "d",
        "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      );
      star.appendChild(path);
      star.style.color = color;
      return star;
    }

    // Form & UI Elements
    const animeForm = document.getElementById("animeForm");
    const watchedList = document.getElementById("watchedList");
    const recommendedList = document.getElementById("recommendedList");

    // Edit modal elements
    const editModal = document.getElementById("editModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const editForm = document.getElementById("editForm");
    const editTitle = document.getElementById("editTitle");
    const editGenre = document.getElementById("editGenre");
    const editSeason = document.getElementById("editSeason");
    const editRating = document.getElementById("editRating");
    const editRecommended = document.getElementById("editRecommended");

    // Variables to track edits
    let currentEditId = null;

    // Validation helpers
    function showError(input, errorId, message) {
      const errorEl = document.getElementById(errorId);
      errorEl.textContent = message;
      errorEl.style.display = "block";
      input.setAttribute("aria-invalid", "true");
    }

    function clearError(input, errorId) {
      const errorEl = document.getElementById(errorId);
      errorEl.textContent = "";
      errorEl.style.display = "none";
      input.removeAttribute("aria-invalid");
    }

    function validateInput(input, errorId) {
      const val = input.value.trim();
      switch (input.id) {
        case "title":
        case "editTitle":
          if (val.length === 0) {
            showError(input, errorId, "Please enter a title.");
            return false;
          }
          break;
        case "genre":
        case "editGenre":
          if (val.length === 0) {
            showError(input, errorId, "Please enter at least one genre.");
            return false;
          }
          break;
        case "season":
        case "editSeason":
          const seasonNum = Number(val);
          if (!val || isNaN(seasonNum) || seasonNum < 1 || !Number.isInteger(seasonNum)) {
            showError(input, errorId, "Please enter a valid season number.");
            return false;
          }
          break;
        case "rating":
        case "editRating":
          const ratingNum = Number(val);
          if (!val || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
            showError(input, errorId, "Please enter a rating from 1 to 10.");
            return false;
          }
          break;
      }
      clearError(input, errorId);
      return true;
    }

    // Create a list item for anime
    // The ID is used internally to track entries and allow editing
    function createAnimeListItem(anime) {
      const li = document.createElement("li");
      li.classList.add("anime-item");
      li.tabIndex = 0;
      li.dataset.animeId = anime.id;

      // Title
      const titleEl = document.createElement("div");
      titleEl.className = "anime-title";
      titleEl.textContent = anime.title;
      li.appendChild(titleEl);

      // Details container
      const detailsEl = document.createElement("div");
      detailsEl.className = "anime-details";

      // Genre
      const genreEl = document.createElement("span");
      genreEl.textContent = `Genre: ${anime.genre}`;
      detailsEl.appendChild(genreEl);

      // Season
      const seasonEl = document.createElement("span");
      seasonEl.textContent = `Season: ${anime.season}`;
      detailsEl.appendChild(seasonEl);

      // Rating with stars
      const ratingEl = document.createElement("span");
      ratingEl.className = "rating";
      ratingEl.setAttribute("aria-label", `Rating: ${anime.rating} out of 10`);
      // Show stars proportional to rating (each star = 2 points)
      const starsCount = Math.round(anime.rating / 2); // 1-5 stars
      for (let i = 0; i < 5; i++) {
        const star = createStarSVG();
        star.style.color = i < starsCount ? "#ffb400" : "#ccc";
        ratingEl.appendChild(star);
      }

      // Numeric rating after stars
      const ratingNumber = document.createElement("span");
      ratingNumber.textContent = ` (${anime.rating}/10)`;
      ratingNumber.style.color = "#555";
      ratingEl.appendChild(ratingNumber);

      detailsEl.appendChild(ratingEl);

      // Recommended badge if applicable
      if (anime.recommended) {
        const recBadge = document.createElement("span");
        recBadge.textContent = "Recommended";
        recBadge.className = "badge-recommended";
        recBadge.setAttribute("aria-label", "This anime is recommended");
        detailsEl.appendChild(recBadge);
      }

      li.appendChild(detailsEl);

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.className = "edit-button";
      editBtn.type = "button";
      editBtn.textContent = "Edit";
      editBtn.setAttribute("aria-label", `Edit anime ${anime.title}`);
      editBtn.addEventListener("click", () => openEditModal(anime.id));
      li.appendChild(editBtn);

      return li;
    }

    // Data storage: We'll store anime in an array with unique IDs.
    // IDs help track items for edit functionality
    let animeDataStore = [];
    let nextId = 1;

    // Add anime to data store and update UI lists accordingly
    function addAnime(anime) {
      anime.id = nextId++;
      animeDataStore.push(anime);
      renderLists();
    }

    // Update anime by id
    function updateAnimeById(id, updatedAnime) {
      const index = animeDataStore.findIndex(anime => anime.id === id);
      if (index > -1) {
        animeDataStore[index] = { id, ...updatedAnime };
        renderLists();
      }
    }

    // Render the two lists from data store
    function renderLists() {
      watchedList.innerHTML = "";
      recommendedList.innerHTML = "";

      animeDataStore.forEach(anime => {
        const watchedItem = createAnimeListItem(anime);
        watchedList.appendChild(watchedItem);

        if (anime.recommended) {
          const recommendedItem = createAnimeListItem(anime);
          recommendedList.appendChild(recommendedItem);
        }
      });
    }

    // Validate entire form, returns true if all fields valid
    function validateForm(formPrefix = "") {
      const titleInput = document.getElementById(formPrefix + "title");
      const genreInput = document.getElementById(formPrefix + "genre");
      const seasonInput = document.getElementById(formPrefix + "season");
      const ratingInput = document.getElementById(formPrefix + "rating");

      const validTitle = validateInput(titleInput, formPrefix + "TitleError");
      const validGenre = validateInput(genreInput, formPrefix + "GenreError");
      const validSeason = validateInput(seasonInput, formPrefix + "SeasonError");
      const validRating = validateInput(ratingInput, formPrefix + "RatingError");

      return validTitle && validGenre && validSeason && validRating;
    }

    // Clear form inputs and errors
    function clearForm(form, prefix = "") {
      form.reset();
      ["TitleError", "GenreError", "SeasonError", "RatingError"].forEach(errorId => {
        const errorEl = document.getElementById(prefix + errorId);
        if (errorEl) errorEl.style.display = "none";
      });
    }

    // Handle add anime form submit
    animeForm.addEventListener("submit", e => {
      e.preventDefault();

      if (!validateForm()) return;

      const newAnime = {
        title: animeForm.title.value.trim(),
        genre: animeForm.genre.value.trim(),
        season: Number(animeForm.season.value.trim()),
        rating: Number(animeForm.rating.value.trim()),
        recommended: animeForm.recommended.checked,
      };

      addAnime(newAnime);
      clearForm(animeForm);
      animeForm.title.focus();
    });

    // Edit Modal handlers

    // Open edit modal with data loaded
    function openEditModal(id) {
      currentEditId = id;
      const anime = animeDataStore.find(a => a.id === id);
      if (!anime) return;

      editTitle.value = anime.title;
      editGenre.value = anime.genre;
      editSeason.value = anime.season;
      editRating.value = anime.rating;
      editRecommended.checked = anime.recommended;

      clearForm(editForm, "edit");
      editModal.classList.add("active");
      editModal.focus();
    }

    // Close modal and clean up
    function closeEditModal() {
      currentEditId = null;
      editModal.classList.remove("active");
    }

    closeModalBtn.addEventListener("click", closeEditModal);

    // Close modal on overlay click (but not modal content)
    editModal.addEventListener("click", (e) => {
      if (e.target === editModal) {
        closeEditModal();
      }
    });

    // Handle ESC to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && editModal.classList.contains("active")) {
        closeEditModal();
      }
    });

    // Edit form submit handler
    editForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!validateForm("edit")) return;

      if (currentEditId === null) return;

      const updatedAnime = {
        title: editTitle.value.trim(),
        genre: editGenre.value.trim(),
        season: Number(editSeason.value.trim()),
        rating: Number(editRating.value.trim()),
        recommended: editRecommended.checked,
      };

      updateAnimeById(currentEditId, updatedAnime);
      closeEditModal();
    });

    // Real-time validation for both forms
    const realTimeFields = [
      { id: "title", errorId: "TitleError" },
      { id: "genre", errorId: "GenreError" },
      { id: "season", errorId: "SeasonError" },
      { id: "rating", errorId: "RatingError" },
      { id: "editTitle", errorId: "editTitleError" },
      { id: "editGenre", errorId: "editGenreError" },
      { id: "editSeason", errorId: "editSeasonError" },
      { id: "editRating", errorId: "editRatingError" },
    ];

    realTimeFields.forEach(({ id, errorId }) => {
      const input = document.getElementById(id);
      input.addEventListener("input", () => clearError(input, errorId));
      input.addEventListener("blur", () => validateInput(input, errorId));
    });

    // Initial focus management to enhance accessibility
    animeForm.title.focus();

  })();

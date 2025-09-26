document.getElementById('addAnimeForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const title = document.getElementById('add-title').value.trim();
    const genre = document.getElementById('add-genre').value.trim();
    const season = document.getElementById('add-season').value.trim();
    const rating = document.getElementById('add-rating').value.trim();
    const recommended = document.getElementById('add-recommended').checked;
    const fileInput = document.getElementById('add-image');
    const file = fileInput.files[0];
  
    if (!title || !genre || !season || !rating) {
      alert('Please fill in all required fields.');
      return;
    }
  
    // buat objek anime
    const newAnime = {
      id: '_' + Math.random().toString(36).substr(2, 9),
      title,
      genre,
      season,
      rating,
      recommended,
      image: null // default null, nanti isi base64 kalau ada
    };
  
    // kalau ada gambar → baca pakai FileReader
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        newAnime.image = e.target.result;
        addAnimeToList(newAnime);
        document.getElementById('addAnimeForm').reset();
      };
      reader.readAsDataURL(file);
    } else {
      // kalau tidak ada gambar tetap tambah ke list
      addAnimeToList(newAnime);
      document.getElementById('addAnimeForm').reset();
    }
  });
  
  // fungsi untuk menambahkan ke list
  function addAnimeToList(anime) {
    const li = document.createElement('li');
    li.className = 'anime-item';
  
    const header = document.createElement('div');
    header.className = 'anime-header';
  
    const title = document.createElement('div');
    title.className = 'anime-title';
    title.textContent = anime.title;
  
    header.appendChild(title);
    li.appendChild(header);
  
    // detail
    const details = document.createElement('div');
    details.className = 'anime-details';
  
    details.innerHTML = `
      <span>Genre: ${anime.genre}</span>
      <span>Season: ${anime.season}</span>
      <span>Rating: ${anime.rating}/10</span>
    `;
  
    if (anime.recommended) {
      const badge = document.createElement('span');
      badge.className = 'badge-recommended';
      badge.textContent = 'Recommended';
      details.appendChild(badge);
    }
  
    li.appendChild(details);
  
    // tampilkan gambar jika ada
    if (anime.image) {
      const img = document.createElement('img');
      img.src = anime.image;
      img.alt = `${anime.title} cover`;
      img.className = 'anime-image';
      img.style.maxWidth = '120px';
      img.style.marginTop = '8px';
      li.appendChild(img);
    }
  
    // masukkan ke watched list
    document.getElementById('watchedList').appendChild(li);
  
    // duplikat ke recommended jika dicentang
    if (anime.recommended) {
      const recLi = li.cloneNode(true);
      document.getElementById('recommendedList').appendChild(recLi);
    }
  }
  
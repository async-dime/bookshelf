let books = [];
let theme = '';

window.onload = () => {
  theme = localStorage.getItem('theme') || '';
  books = JSON.parse(localStorage.getItem('book')) || [];
  updateUI(books, theme);

  $('form').onsubmit = addBook;

  $('.toolbar>.form-input').onchange = searchData;

  $('#isComplete').onclick = (e) => {
    $('form>button').innerText = e.target.checked
      ? 'Simpan as sudah dibaca'
      : 'Simpan as belum dibaca';
  };

  $('#tambahBuku').onclick = () => {
    const isEdit = $('form').id;
    const isShown = !$('.input-data').classList.contains('hide');

    if (isShown && isEdit) {
      if (confirm('Yakin gak jadi edit data?')) {
        $('.input-data>h3').innerText = 'Tambah Data';
        $('form').removeAttribute('id');
        $('form').reset();
      }
    } else {
      $('.input-data').classList.toggle('hide');
    }
  };

  toastInit();
};

setTheme = (theme) => {
  document.documentElement.className = theme;
  localStorage.setItem('theme', theme);
};

updateUI = (books, theme) => {
  document.documentElement.className = theme;

  const finished = $('.dah-dibaca'),
    unfinished = $('.lom-dibaca');

  (finished.innerHTML = ''), (unfinished.innerHTML = '');

  for (let book of books) {
    let item = $new('div', { id: book.id, css: ['buku'] });
    let title = $new('h4', { text: `${book.title}` });
    let author = $new('p', { text: `Penulis: ${book.author}` });
    let year = $new('p', { text: `Tahun: ${book.year}` });
    let group = $new('button', {
      css: ['button', 'button-success'],
      text: `${book.isComplete ? 'Belum selesai' : 'Selesai'}`,
      action: [moveGroup],
    });
    let remove = $new('button', {
      css: ['button', 'button-danger'],
      text: 'Hapus',
      action: [removeBook],
    });
    let edit = $new('button', {
      css: ['button', 'button-warning'],
      text: 'Edit',
      action: [editBook],
    });

    [title, author, year, group, remove, edit].forEach((e) =>
      item.appendChild(e)
    );

    book.isComplete ? finished.appendChild(item) : unfinished.appendChild(item);
  }

  !finished.hasChildNodes() ? (finished.innerHTML = 'Empty') : 0;
  !unfinished.hasChildNodes() ? (unfinished.innerHTML = 'Empty') : 0;
};

position = (e) => books.findIndex((i) => i.id == e.target.parentNode.id);

moveGroup = (e) => {
  books[position(e)].isComplete = !books[position(e)].isComplete;
  popToast(
    'Sukses',
    `Buku ${books[position(e)].title} ${
      books[position(e)].isComplete ? 'selesai' : 'belum selesai'
    } dibaca`,
    'success'
  );
  saveData();
  updateUI(books, theme);
};

removeBook = (e) => {
  if (confirm('Serius nih, mau dihapus?')) {
    popToast(
      'Sukses',
      `Buku ${books[position(e)].title} telah terhapus`,
      'success'
    );
    books.splice(position(e), 1);
    saveData();
    updateUI(books, theme);
  }
};

editBook = (e) => {
  $('#title').value = books[position(e)].title;
  $('#author').value = books[position(e)].author;
  $('#year').value = books[position(e)].year;
  $('#isComplete').checked = books[position(e)].isComplete;

  $('form').id = position(e);

  $('.input-data>h3').innerText = 'Edit Data';
  $('.input-data').classList.remove('hide');
  $('.input-data').scrollIntoView();

  $('#title').focus();
};

addBook = () => {
  const position = $('form').id;

  let model = {
    id: +new Date(),
    title: $('#title').value,
    author: $('#author').value,
    year: $('#year').value,
    isComplete: $('#isComplete').checked,
  };

  if (position) {
    books[position].title = model.title;
    books[position].author = model.author;
    books[position].year = model.year;
    books[position].isComplete = model.isComplete;
    popToast('Sukses', `Buku ${model.title} berhasil diedit`, 'success');
  } else {
    books.push(model);
    popToast('Sukses', `Buku ${model.title} berhasil dimasukkan`, 'success');
  }

  saveData();
  updateUI(books, theme);
};

searchData = (e) => {
  e = e.target.value;

  let getByTitle = books.filter((book) =>
    book.title.trim().toLowerCase().includes(e.trim().toLowerCase())
  );
  let getByAuthor = books.filter((book) =>
    book.author.trim().toLowerCase().includes(e.trim().toLowerCase())
  );
  let getByYear = books.filter((book) => book.year.trim().includes(e.trim()));

  localStorage.getItem('book') == null || books == []
    ? popToast(
        'Gagal',
        `Database kosong, harap isi dengan buku favorit anda.`,
        'error'
      )
    : getByTitle.length == 0
    ? getByAuthor.length == 0
      ? getByYear.length == 0
        ? popToast(
            'Gagal',
            `Tidak ditemukan buku dengan kata kunci: ${e}`,
            'error'
          )
        : updateUI(getByYear, theme)
      : updateUI(getByAuthor, theme)
    : updateUI(getByTitle, theme);
};

saveData = () => {
  localStorage.setItem('book', JSON.stringify(books));
};

$new = (e, a) => {
  e = document.createElement(e);
  a.id ? (e.id = a.id) : 0;
  a.text ? (e.innerText = a.text) : 0;
  a.html ? (e.innerHTML = a.html) : 0;
  a.action ? a.action.forEach((action) => (e.onclick = action)) : 0;
  a.css ? a.css.forEach((css) => e.classList.add(css)) : 0;
  return e;
};

$ = (e) => {
  e = document.querySelectorAll(e);
  return e.length >= 1 ? e[0] : e;
};

const popToast = (title, text, type) => {
  toast.create({
    title,
    text,
    type,
  });
};

toast = {
  create: () => {},
};

toastInit = () => {
  let toastContainer = $new('div', {
    id: 'poptoast-container',
  });
  document.body.appendChild(toastContainer);

  toast.create = (options) => {
    const containerId = document.getElementById('poptoast-container');
    const removeToast = () => containerId.removeChild(toast);

    let toast = $new('div', {
      id: 'toast-' + new Date(),
      css: ['poptoast-toast'],
    });
    let h4 = $new('h4', {
      css: ['poptoast-title'],
      html: options.title,
    });
    let p = $new('p', {
      css: ['poptoast-text'],
      html: options.text,
    });

    [h4, p].forEach((e) => toast.appendChild(e));

    toast.hide = () => {
      toast.className += ' poptoast-fadeOut';
      toast.addEventListener('animationend', removeToast, false);
    };
    options.timeout = setTimeout(toast.hide, 3500);
    options.type = toast.className += ' poptoast-' + options.type;
    toast.onclick = toast.hide;
    typeof options.callback === 'function'
      ? (toast.onclick = options.callback)
      : 0;
    containerId.appendChild(toast);

    return toast;
  };
};

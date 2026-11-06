/* ==========================================================================
   Birthday website — script.js

   Sections:
   1. Settings
   2. Helpers
   3. Supabase
   4. Photo data
   4b. Photo viewer + delete confirmation
   5. Lock screen & Memory PIN screen
   6. Loading screen
   7. Panels (letter, gallery, music, bouquet, cake)
   8. Dashboard & sheet
   ========================================================================== */


/* ---------- 1. Settings ------------------------------------------------- */

const PIN = "0407";         // Main app lock screen PIN
const MEMORY_PIN = "1234";  // Separate 4-digit PIN for "Our Memories"

const SUPABASE = {
  url: "https://mptygbzfgxxwmasxprkj.supabase.co",
  key: "sb_publishable_0wA3h7iRdH_8qh7oTr0TKQ_ANgiAJHG",
  bucket: "photos",
  table: "memories",
};

const CATEGORIES = [
  "1st Meetup",
  "2nd Meetup",
  "3rd Meetup",
  "4th Meetup",
];

const COMPLIMENTS = [
  "MWA",
  "MWA MWA ",
  "MWA MWA MWA",
  "MWA MWA MWA MWA",
  "I LOVE YOUUUUU",
  "I MISS YOUUU",
  "MAHAL NA MAHAL KITAA",
  "I LOVE YOUU NG MARAMIII",
];

const LETTER = `Happy birthday mahal ko!!! Another year has been added to your life, and I hope this new chapter brings you nothing but happiness, good health, more blessings, and beautiful memories.

I hope the days ahead are filled with unexpected good things, answered prayers, and more opportunities that bring you closer to everything you've dreamed of.

I just want you to know how thankful I am for you, even for the little things that you might not think much about. Thank you for your time, sa presence mo, and for simply being someone I can be grateful for. You make my days so, so much brighter just by existing, and having you sa buhay ko is something I will never take for granted.

Minsan ang hirap i-explain kung gaano ko naa-appreciate ikaw, pero I'm so happy that nakilala kita and shared a part of my life with you. Thank you rin kay God for bringing you into my life. Among all the things I could be thankful for, having you is definitely one of them.

I pray that He continues to guide you, protect you from anything na pwedeng makasakit sa'yo, and give you strength para sa mga challenges na darating sa buhay mo.

Sana baby maabot mo lahat ng gusto mo sa buhay. Sana hindi ka mapagod sa pag-chase mo sa mga bagay na nagpapasaya sa'yo. And even when things don't go as planned, I hope you never lose faith in yourself.

Remember, you still have so many things ahead of you. There's so much more to experience, discover, and be happy about.

Siguro minsan hindi ko alam yung perfect na words, pero sana yung actions ko and the way I treat you will always remind you how much you mean to me. I hope I can be part of more of your birthdays and witness more of the beautiful things life has in store for you.

Kaya today, just enjoy yourself. Always remember you deserve to feel special, loved, and appreciated. Never forget how precious you are, mahal ko.

I'm always wishing and praying for your happiness, success, and everything good in this world.

Happy birthday again, mahal ko!! Mahal na mahal kita ng sobraaaa!!!!!`;

const CARDS = [
  { id: "letter", title: "Birthday Letter", hint: "a note for you" },
  { id: "gallery", title: "Our Memories", hint: "four moments, and more to come" },
  { id: "music", title: "Songs that remind me of you", hint: "I love you" },
  { id: "flower", title: "A Flower for my darling", hint: "" },
  { id: "cake", title: "Cake for my baby", hint: "blow mo ako (cake)" },
];


/* ---------- 2. Helpers -------------------------------------------------- */

const $ = (id) => document.getElementById(id);

const rnd = (min, max) => min + Math.random() * (max - min);

const HEART = `<svg width="30" height="30" viewBox="0 0 24 24" fill="#e57a9c">
  <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.7A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>
</svg>`;

const TRASH = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>
</svg>`;

function tag(name, attrs = {}, inner = "") {
  const attributes = Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");

  return `<${name}${attributes}>${inner}</${name}>`;
}

function confetti() {
  const colors = ["#e57a9c", "#f6a5bc", "#fde8ef", "#f7d56b", "#fff"];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");

    piece.className = "cf";
    piece.style.left = `${rnd(0, 100)}vw`;
    piece.style.background = colors[i % colors.length];
    piece.style.border = "1px solid #f3d9e2";
    piece.style.animationDelay = `${rnd(0, 0.7)}s`;

    document.body.appendChild(piece);

    setTimeout(() => piece.remove(), 3700);
  }
}

function popBubble(container, className, photoUrl, area) {
  const bubble = document.createElement("div");

  bubble.className = className;

  bubble.innerHTML = photoUrl
    ? `<img alt="" src="${photoUrl}" style="width:100%;height:100%;object-fit:cover">`
    : HEART;

  bubble.style.left = `${rnd(area.left[0], area.left[1])}%`;
  bubble.style.top = `${rnd(area.top[0], area.top[1])}%`;

  container.appendChild(bubble);

  setTimeout(() => bubble.remove(), 1500);
}


/* ---------- 3. Supabase ------------------------------------------------- */

const supabaseReady = () => Boolean(SUPABASE.url && SUPABASE.key);

const authHeaders = () => ({
  apikey: SUPABASE.key,

  ...(SUPABASE.key.startsWith("eyJ")
    ? { Authorization: `Bearer ${SUPABASE.key}` }
    : {}),
});

const publicUrl = (path) =>
  `${SUPABASE.url}/storage/v1/object/public/${SUPABASE.bucket}/${path}`;

async function fetchMemories() {
  const response = await fetch(
    `${SUPABASE.url}/rest/v1/${SUPABASE.table}?select=*`,
    {
      headers: authHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorDetails = await response.text();

    throw new Error(
      `Failed to fetch memories (${response.status}): ${errorDetails}`
    );
  }

  const rows = await response.json();

  if (!Array.isArray(rows)) {
    throw new Error("Invalid memories response from Supabase.");
  }

  return rows;
}

async function saveMemory(file, category, caption) {
  if (!supabaseReady()) {
    throw new Error("Supabase is not connected.");
  }

  if (!file || !category) {
    throw new Error("Please select a photo and category.");
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WEBP image.");
  }

  const safeName = file.name.replace(/[^\w.-]/g, "_");
  const uniqueName = `${crypto.randomUUID()}_${safeName}`;

  const safeCategory = category.replace(/[^\w-]/g, "_");

  const path = `${safeCategory}/${uniqueName}`;

  const encodedPath = path
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const upload = await fetch(
    `${SUPABASE.url}/storage/v1/object/${SUPABASE.bucket}/${encodedPath}`,
    {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: file,
    }
  );

  if (!upload.ok) {
    const details = await upload.text();

    throw new Error(
      `Image upload failed (${upload.status}): ${details}`
    );
  }

  try {
    const row = await fetch(
      `${SUPABASE.url}/rest/v1/${SUPABASE.table}`,
      {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          category,
          caption,
          path,
        }),
      }
    );

    if (!row.ok) {
      const details = await row.text();

      throw new Error(
        `Database save failed (${row.status}): ${details}`
      );
    }

    const createdRows = await row.json();

    if (!createdRows.length || !createdRows[0].id) {
      throw new Error(
        "Database did not return the saved photo record."
      );
    }

    return {
      src: publicUrl(path),
      id: createdRows[0].id,
      path,
    };

  } catch (error) {
    await fetch(
      `${SUPABASE.url}/storage/v1/object/${SUPABASE.bucket}/${encodedPath}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    ).catch(() => {});

    throw error;
  }
}

async function deleteMemory(item) {
  if (!supabaseReady()) {
    throw new Error("Supabase is not connected.");
  }

  if (!item?.id || !item?.path) {
    throw new Error("Photo ID or Storage path is missing.");
  }

  const encodedPath = item.path
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const file = await fetch(
    `${SUPABASE.url}/storage/v1/object/${SUPABASE.bucket}/${encodedPath}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );

  if (!file.ok) {
    const errorText = await file.text();

    if (
      file.status !== 404 ||
      !errorText.toLowerCase().includes("not_found")
    ) {
      throw new Error(`Storage deletion failed: ${errorText}`);
    }
  }

  const row = await fetch(
    `${SUPABASE.url}/rest/v1/${SUPABASE.table}?id=eq.${encodeURIComponent(item.id)}&select=id`,
    {
      method: "DELETE",
      headers: {
        ...authHeaders(),
        Prefer: "return=representation",
      },
    }
  );

  if (!row.ok) {
    const error = await row.text();

    throw new Error(`Database deletion failed: ${error}`);
  }

  const removed = await row.json();

  if (!removed.length) {
    throw new Error(
      "No database record was deleted. Check your RLS policies."
    );
  }

  return true;
}


/* ---------- 4. Photo data ----------------------------------------------- */

const photos = {};

CATEGORIES.forEach((category) => {
  photos[category] = [
    { caption: `${category} ♡` },
    { caption: "A sweet moment" },
  ];
});


/* ---------- 4b. Photo viewer + delete confirmation ---------------------- */

let dismissConfirm = null;

function openLightbox(item) {
  $("lbi").src = item.src;
  $("lbt").textContent = item.caption || "";

  $("lightbox").classList.add("show");
}

function closeLightbox() {
  $("lightbox").classList.remove("show");
  $("lbi").removeAttribute("src");
}

function confirmDelete() {
  return new Promise((resolve) => {
    const dialog = $("confirm");

    const finish = (answer) => {
      dialog.classList.remove("show");
      dismissConfirm = null;
      resolve(answer);
    };

    dismissConfirm = () => finish(false);

    $("cyes").onclick = () => finish(true);
    $("cno").onclick = () => finish(false);

    dialog.onclick = (event) => {
      if (event.target === dialog) {
        finish(false);
      }
    };

    dialog.classList.add("show");
  });
}


/* ---------- 5. Lock screen & Memory PIN Modal --------------------------- */

function initPinPad(containerId, dotsId, titleText, subtitleText, correctPin, onSuccess, onCancel) {
  const container = $(containerId);
  container.innerHTML = `
    <div class="lock" id="${containerId}-inner">
      <h2>${titleText}</h2>
      <p>${subtitleText}</p>
      <div class="dots" id="${dotsId}"><i></i><i></i><i></i><i></i></div>
      <div class="pad" id="${containerId}-pad"></div>
      ${onCancel ? `<button id="${containerId}-cancel" style="margin-top:16px;font-size:13px;padding:6px 16px;min-height:36px;">Cancel</button>` : ""}
    </div>
  `;

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
  const dotsEl = $(dotsId);
  const dots = [...dotsEl.children];
  let entered = "";

  const renderDots = () => {
    dots.forEach((dot, i) => {
      dot.classList.toggle("on", i < entered.length);
    });
  };

  const checkPin = () => {
    if (entered === correctPin) {
      onSuccess();
      return;
    }

    $(`${containerId}-inner`).classList.add("shake");

    setTimeout(() => {
      $(`${containerId}-inner`).classList.remove("shake");
      entered = "";
      renderDots();
    }, 450);
  };

  keys.forEach((key) => {
    const button = document.createElement("button");
    button.textContent = key;

    if (!key) {
      button.style.visibility = "hidden";
    }

    button.onclick = () => {
      if (key === "⌫") {
        entered = entered.slice(0, -1);
      } else if (entered.length < 4) {
        entered += key;
      }

      renderDots();

      if (entered.length === 4) {
        setTimeout(checkPin, 150);
      }
    };

    $(`${containerId}-pad`).appendChild(button);
  });

  if (onCancel && $(`${containerId}-cancel`)) {
    $(`${containerId}-cancel`).onclick = onCancel;
  }
}

function initLock() {
  initPinPad("lock", "dots", "I LOVE YOU!!", "ENTER OUR PIN", PIN, () => {
    startLoading();
    $("lock").classList.add("hide");
  });
}


/* ---------- 6. Loading screen (Smooth & Optimized) ---------------------- */

const LOADING_MESSAGES = [
  "I love you so much baby…",
  "MWAAAAAA",
  "Patience is virtue",
  "almost there babyy♡",
];

const MIN_LOADING_MS = 3800;

async function startLoading() {
  const screen = $("load");

  screen.style.transition = "none";
  screen.classList.remove("hide");

  void screen.offsetWidth;

  screen.style.transition = "";

  const startedAt = performance.now();

  const progress = {
    done: 0,
    total: 1,
  };

  let photoUrls = [];

  const spawn = () => {
    const url = photoUrls.length
      ? photoUrls[Math.floor(rnd(0, photoUrls.length))]
      : null;

    popBubble(
      screen,
      "bub",
      url,
      {
        left: [4, 78],
        top: [6, 78],
      }
    );
  };

  const bubbleTimer = setInterval(spawn, 500);

  spawn();

  const loadPhotos = async () => {
    if (supabaseReady()) {
      try {
        const rows = await fetchMemories();

        const seen = new Set();

        const uniqueRows = rows.filter((row) => {
          if (!row.path || !photos[row.category]) {
            return false;
          }

          const identifier = String(row.id ?? row.path);

          if (seen.has(identifier)) {
            return false;
          }

          seen.add(identifier);

          return true;
        });

        uniqueRows.forEach((row) => {
          const alreadyExists = photos[row.category].some(
            (item) =>
              item.id === row.id ||
              item.path === row.path
          );

          if (!alreadyExists) {
            photos[row.category].push({
              src: publicUrl(row.path),
              caption: row.caption || "",
              id: row.id,
              path: row.path,
            });
          }
        });

        photoUrls = uniqueRows.map((row) =>
          publicUrl(row.path)
        );

        progress.total = 1 + photoUrls.length;
        progress.done = 1;

        await Promise.all(
          photoUrls.map(
            (url) =>
              new Promise((resolve) => {
                const img = new Image();

                img.onload = img.onerror = () => {
                  progress.done++;
                  resolve();
                };

                img.src = url;
              })
          )
        );

      } catch (error) {
        console.error("Supabase loading error:", error);
      }
    }

    progress.done = progress.total;
  };

  const photoLoading = loadPhotos();

  let shown = 0;
  let lastPercent = -1;

  const tick = () => {
    const timePart = Math.min(
      1,
      (performance.now() - startedAt) / MIN_LOADING_MS
    );

    const dataPart = progress.done / progress.total;

    const target = Math.min(timePart, dataPart) * 100;

    shown = Math.min(
      target,
      shown + Math.max(0.4, (target - shown) * 0.1)
    );

    const percent = Math.floor(shown);

    if (percent !== lastPercent) {
      lastPercent = percent;
      $("pc").textContent = `${percent}%`;

      $("lm").textContent =
        percent >= 100
          ? "welcome, my love ♡"
          : LOADING_MESSAGES[
              Math.min(3, Math.floor(shown / 26))
            ];
    }

    $("bf").style.transform = `scaleX(${shown / 100})`;

    if (shown >= 99.9) {
      clearInterval(bubbleTimer);

      $("pc").textContent = "100%";
      $("bf").style.transform = "scaleX(1)";

      setTimeout(() => {
        screen.classList.add("hide");
      }, 500);

    } else {
      requestAnimationFrame(tick);
    }
  };

  photoLoading.finally(() => {
    progress.done = progress.total;
  });

  tick();
}


/* ---------- 7. Panels ---------------------------------------------------- */


/* ---------- 7a. Letter — typewriter effect ------------------------------- */

function renderLetter(body) {
  body.innerHTML = `<div class="letter" id="lt"></div>`;

  const letter = $("lt");

  let index = 0;
  const timer = setInterval(() => {
    letter.textContent = LETTER.slice(0, ++index);

    if (index >= LETTER.length) {
      clearInterval(timer);
    }
  }, 40);

  return () => clearInterval(timer);
}


/* ---------- 7b. Gallery — tabs, photo grid and multiple upload ---------- */

function renderGallery(body) {
  let currentTab = CATEGORIES[0];
  let chosenCategory = CATEGORIES[0];

  let chosenFiles = [];
  let isUploading = false;
  let previewUrls = [];

  const dropContent = (title, hint) => `
    <input type="file" id="uf" accept="image/jpeg,image/png,image/webp" multiple hidden>
    <span class="plus">+</span>
    <b>${title}</b>
    ${hint}
  `;

  body.innerHTML = `
    <div class="tabs" id="tb"></div>

    <div class="ph" id="ph"></div>

    <div class="up">
      <h4>Add memories</h4>

      <label class="drop" id="dr">
        ${dropContent(
          "Choose photos",
          "tap here or drop multiple files in"
        )}
      </label>

      <div class="chips" id="ch"></div>

      <input
        type="text"
        id="ucap"
        placeholder="Write a little caption for them"
        maxlength="60"
      >

      <button class="fill" id="ud">
        Add to gallery
      </button>

      <p id="us"></p>
    </div>
  `;

  const dropZone = $("dr");

  const renderCategoryButtons = (
    container,
    active,
    onPick
  ) => {
    container.innerHTML = "";

    CATEGORIES.forEach((category) => {
      const button = document.createElement("button");

      button.textContent = category;
      button.className = category === active ? "act" : "";

      button.onclick = () => onPick(category);

      container.appendChild(button);
    });
  };

  const renderTabs = () => {
    renderCategoryButtons(
      $("tb"),
      currentTab,
      (category) => {
        currentTab = category;
        chosenCategory = category;

        renderTabs();
        renderChips();
        renderGrid();
      }
    );
  };

  const renderChips = () => {
    renderCategoryButtons(
      $("ch"),
      chosenCategory,
      (category) => {
        chosenCategory = category;
        renderChips();
      }
    );
  };

  const renderGrid = () => {
    const items = photos[currentTab];

    const real = items.filter((item) => item.src);

    const visible = real.length ? real : items;

    $("ph").innerHTML = "";

    visible.forEach((item) => {
      const tile = document.createElement("div");

      tile.className = "tile";

      tile.innerHTML =
        (item.src
          ? `<img alt="" src="${item.src}">`
          : HEART) +
        "<span></span>";

      tile.querySelector("span").textContent =
        item.caption || "";

      if (item.src) {
        tile.onclick = () => openLightbox(item);

        const remove = document.createElement("button");

        remove.className = "del";
        remove.setAttribute("aria-label", "Delete photo");
        remove.innerHTML = TRASH;

        remove.onclick = (event) => {
          event.stopPropagation();
          removePhoto(item);
        };

        tile.appendChild(remove);
      }

      $("ph").appendChild(tile);
    });
  };

  const removePhoto = async (item) => {
    const say = (message) => {
      const status = $("us");

      if (status) {
        status.textContent = message;
      }
    };

    if (!(await confirmDelete())) {
      return;
    }

    try {
      await deleteMemory(item);

      const list = Object.values(photos).find(
        (items) => items.includes(item)
      );

      if (list) {
        const index = list.indexOf(item);

        if (index !== -1) {
          list.splice(index, 1);
        }
      }

      closeLightbox();

      renderGrid();

      say("Photo deleted ♡");

    } catch (error) {
      console.error("Photo deletion error:", error);
      say(error.message);
    }
  };

  const clearPreviewUrls = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    previewUrls = [];
  };

  const choosePhotos = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const validFiles = Array.from(fileList).filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length === 0) {
      $("us").textContent =
        "Please choose valid JPG, PNG, or WEBP images.";
      return;
    }

    clearPreviewUrls();
    chosenFiles = validFiles;

    previewUrls = chosenFiles.map((file) => URL.createObjectURL(file));

    dropZone.innerHTML = `
      <img alt="Preview" src="${previewUrls[0]}" style="opacity: 0.85;">
      <div style="position:relative; z-index:2; background:rgba(59,42,49,0.8); color:#fff; padding:6px 14px; border-radius:99px; font-size:13px; font-weight:500;">
        ${chosenFiles.length} photo${chosenFiles.length > 1 ? "s" : ""} selected ♡
      </div>
    `;

    $("us").textContent = "";
  };

  const bindFileInput = () => {
    const input = $("uf");

    if (!input) return;

    input.onchange = (event) => {
      choosePhotos(event.target.files);
    };
  };

  dropZone.ondragover = (event) => {
    event.preventDefault();
    dropZone.classList.add("dg");
  };

  dropZone.ondragleave = () => {
    dropZone.classList.remove("dg");
  };

  dropZone.ondrop = (event) => {
    event.preventDefault();
    dropZone.classList.remove("dg");
    choosePhotos(event.dataTransfer.files);
  };

  $("ud").onclick = async () => {
    const status = $("us");
    const button = $("ud");

    if (isUploading) return;

    if (chosenFiles.length === 0) {
      status.textContent = "Choose at least one photo first.";
      return;
    }

    if (!supabaseReady()) {
      status.textContent = "Supabase is not connected.";
      return;
    }

    const category = chosenCategory;
    const caption = $("ucap").value.trim() || ":))";

    isUploading = true;
    button.disabled = true;
    button.textContent = "Saving memories...";

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < chosenFiles.length; i++) {
      status.textContent = `Uploading photo ${i + 1} of ${chosenFiles.length}...`;
      try {
        const file = chosenFiles[i];
        const saved = await saveMemory(file, category, caption);

        const alreadyExists = photos[category].some(
          (item) => item.id === saved.id || item.path === saved.path
        );

        if (!alreadyExists) {
          photos[category].push({
            src: saved.src,
            id: saved.id,
            path: saved.path,
            caption,
          });
        }
        successCount++;
      } catch (error) {
        console.error("Upload error:", error);
        failCount++;
      }
    }

    currentTab = category;
    renderTabs();
    renderChips();
    renderGrid();

    if (failCount === 0) {
      status.textContent = `Successfully saved ${successCount} photo${successCount > 1 ? "s" : ""}! ♡`;
    } else {
      status.textContent = `Saved ${successCount}, failed ${failCount} photo(s).`;
    }

    chosenFiles = [];
    clearPreviewUrls();
    $("ucap").value = "";

    dropZone.innerHTML = dropContent(
      "Choose photos",
      "tap here or drop multiple files in"
    );

    bindFileInput();

    isUploading = false;
    button.disabled = false;
    button.textContent = "Add to gallery";
  };

  bindFileInput();

  renderTabs();
  renderChips();
  renderGrid();

  return () => {
    clearPreviewUrls();
  };
}


/* ---------- 7c. Soundtrack — MP3 player + photo bubbles ------------------ */

function renderMusic(body) {
  let playing = false;
  let bubbleTimer = null;

  const audio = new Audio("./audio/my-heart-it-beats.mp3");

  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.8;

  body.innerHTML = `
    <div class="stage" id="sg">
      <div class="vc">
        <div class="vinyl" id="vn"></div>

        <h3>My Heart It Beats</h3>

        <div id="sa">a little song for you</div>

        <button class="fill" id="pl" type="button">
          Play Music
        </button>
      </div>
    </div>
  `;

  const stage = body.querySelector("#sg");
  const vinyl = body.querySelector("#vn");
  const status = body.querySelector("#sa");
  const button = body.querySelector("#pl");

  const seekToStart = () => {
    if (Number.isFinite(audio.duration) && audio.duration > 10) {
      audio.currentTime = 10;
    } else if (Number.isFinite(audio.duration)) {
      audio.currentTime = 0;
    }
  };

  audio.addEventListener("loadedmetadata", seekToStart, {
    once: true
  });

  const spawnBubble = () => {
    if (!stage.isConnected) return;

    const realPhotos = Object.values(photos)
      .flat()
      .filter((item) => item.src);

    const photoUrl = realPhotos.length
      ? realPhotos[Math.floor(Math.random() * realPhotos.length)].src
      : null;

    popBubble(
      stage,
      "fl",
      photoUrl,
      {
        left: [3, 78],
        top: [3, 76]
      }
    );
  };

  const startPlayback = async () => {
    try {
      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        seekToStart();
      } else {
        audio.currentTime = 10;
      }

      await audio.play();

      playing = true;

      vinyl.classList.add("sp");
      button.textContent = "Pause Music";
      status.textContent = "playing for you ♡";

      clearInterval(bubbleTimer);

      spawnBubble();

      bubbleTimer = setInterval(spawnBubble, 650);

    } catch (error) {
      console.error("Unable to play music:", error);

      playing = false;

      vinyl.classList.remove("sp");
      button.textContent = "Play Music";

      status.textContent =
        "Unable to play the song. Check the MP3 file ♡";
    }
  };

  const stopPlayback = () => {
    audio.pause();

    playing = false;

    vinyl.classList.remove("sp");

    button.textContent = "Play Music";
    status.textContent = "paused ♡";

    clearInterval(bubbleTimer);
    bubbleTimer = null;
  };

  button.addEventListener("click", async () => {
    if (playing) {
      stopPlayback();
    } else {
      await startPlayback();
    }
  });

  audio.addEventListener("ended", () => {
    playing = false;

    vinyl.classList.remove("sp");

    button.textContent = "Play Music";
    status.textContent = "song finished ♡";

    clearInterval(bubbleTimer);
    bubbleTimer = null;
  });

  audio.addEventListener("error", () => {
    console.error("Audio file could not be loaded:", audio.src);

    status.textContent =
      "Couldn't load the song. Check the MP3 path.";
  });

  return () => {
    stopPlayback();

    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  };
}


/* ---------- 7d. Bouquet — roses, peonies and daisies --------------------- */

const BLOOMS = [
  { x: 180, y: 112, r: 46, type: "rose", colors: ["#c43d6b", "#f08db0"] },
  { x: 118, y: 140, r: 40, type: "peony", colors: ["#f08db0", "#fde1ea"] },
  { x: 244, y: 138, r: 40, type: "peony", colors: ["#f4a58f", "#ffe3d8"] },
  { x: 80, y: 196, r: 34, type: "daisy" },
  { x: 282, y: 194, r: 34, type: "daisy" },
  { x: 180, y: 190, r: 44, type: "peony", colors: ["#e0527f", "#f9b9ce"] },
  { x: 124, y: 236, r: 32, type: "rose", colors: ["#ee7fa4", "#fcd0de"] },
  { x: 236, y: 234, r: 32, type: "rose", colors: ["#d94f7c", "#f7a8c2"] },
];

const LEAVES = [
  [52, 168, -30],
  [308, 166, 30],
  [86, 96, -55],
  [274, 96, 55],
  [180, 48, 0],
  [66, 238, -12],
  [296, 236, 12],
  [130, 66, -35],
  [232, 66, 35],
];

const oneDecimal = (n) => n.toFixed(1);

const rotate = (degrees, x, y) =>
  `rotate(${degrees} ${x} ${y})`;

function leavesMarkup() {
  return LEAVES.map(([x, y, degrees]) =>
    tag("ellipse", {
      cx: x,
      cy: y,
      rx: 30,
      ry: 12,
      transform: rotate(degrees, x, y),
      fill: "#8fbf9f",
    })
  ).join("");
}

function babysBreathMarkup() {
  const dots = [
    [0, 0, 3.6],
    [6, 4, 2.8],
    [-5, 5, 2.6],
  ];

  let markup = "";

  for (let i = 0; i < 16; i++) {
    const angle =
      -Math.PI * (0.04 + (i / 15) * 1.12);

    const spread = (i % 3) * 7;

    const x =
      180 + Math.cos(angle) * (140 + spread);

    const y =
      168 + Math.sin(angle) * (122 + spread);

    markup += dots
      .map(([dx, dy, r]) =>
        tag("circle", {
          cx: oneDecimal(x + dx),
          cy: oneDecimal(y + dy),
          r,
          fill: "#fff",
          stroke: "#f3d9e2",
        })
      )
      .join("");
  }

  return markup;
}

function bloomMarkup(bloom, index) {
  const { x, y, r, type, colors } = bloom;

  let petals = "";
  let gradient = "";

  const ring = (count, distance, offset, width) => {
    for (let j = 0; j < count; j++) {
      petals += tag("ellipse", {
        cx: x,
        cy: y - r * distance,
        rx: oneDecimal(r * width),
        ry: oneDecimal(r * width * 1.25),
        transform: rotate(
          (j * 360) / count + offset,
          x,
          y
        ),
        fill: `url(#f${index})`,
        stroke: "#fff",
        "stroke-opacity": 0.6,
        "stroke-width": 1,
      });
    }
  };

  if (type === "daisy") {
    for (let j = 0; j < 16; j++) {
      petals += tag("ellipse", {
        cx: x,
        cy: y - r * 0.62,
        rx: oneDecimal(r * 0.13),
        ry: oneDecimal(r * 0.4),
        transform: rotate(j * 22.5, x, y),
        fill: "#fff",
        stroke: "#f3d9e2",
        "stroke-width": 0.8,
      });
    }

    petals += tag("circle", {
      cx: x,
      cy: y,
      r: oneDecimal(r * 0.26),
      fill: "#f5c542",
    });

    petals += tag("circle", {
      cx: x,
      cy: y,
      r: oneDecimal(r * 0.12),
      fill: "#e39d20",
    });

  } else {
    gradient = tag(
      "radialGradient",
      {
        id: `f${index}`,
        gradientUnits: "userSpaceOnUse",
        cx: x,
        cy: y,
        r,
      },
      tag("stop", {
        offset: 0,
        "stop-color": colors[0],
      }) +
      tag("stop", {
        offset: 1,
        "stop-color": colors[1],
      })
    );

    if (type === "rose") {
      ring(6, 0.55, 0, 0.34);
      ring(5, 0.36, 25, 0.28);
      ring(4, 0.18, 10, 0.2);

      petals += tag("path", {
        d: `M${x} ${y}m-2 0a2 2 0 1 1 4 0a4 4 0 1 1-8 0a6 6 0 1 1 12 0`,
        stroke: "#fff",
        "stroke-opacity": 0.65,
        "stroke-width": 1.3,
        fill: "none",
      });

    } else {
      ring(9, 0.58, 0, 0.3);
      ring(7, 0.4, 20, 0.27);
      ring(5, 0.22, 10, 0.2);

      petals += tag("circle", {
        cx: x,
        cy: y,
        r: oneDecimal(r * 0.1),
        fill: "#f7d56b",
      });
    }
  }

  const markup = tag(
    "g",
    {
      class: "gw",
      style: `animation-delay:${(0.15 + index * 0.12).toFixed(2)}s`,
    },
    tag(
      "g",
      {
        class: "pt",
        "data-i": index,
        style: `animation-delay:-${(index * 0.6).toFixed(1)}s`,
      },
      petals
    )
  );

  return {
    gradient,
    markup,
  };
}

const WRAPPING = [
  '<path d="M62 252L298 252L212 430Q180 440 148 430Z" fill="#f6b3c7"/>',
  '<path d="M62 252L180 304L298 252L212 430Q180 440 148 430Z" fill="#fff6f8" stroke="#f3d9e2"/>',
  '<path d="M180 304L196 430M180 304L164 430" stroke="#f3d9e2" fill="none"/>',
  '<path d="M118 338Q180 356 242 338L236 358Q180 376 124 358Z" fill="#e57a9c"/>',
  '<path d="M180 352C138 314 112 350 146 360C164 364 176 358 180 352Z" fill="#ee8fae"/>',
  '<path d="M180 352C222 314 248 350 214 360C196 364 184 358 180 352Z" fill="#ee8fae"/>',
  '<path d="M176 360L150 414L170 404L180 372ZM184 360L210 414L190 404L180 372Z" fill="#e57a9c"/>',
  '<circle cx="180" cy="352" r="9" fill="#d9567f"/>',
].join("");

function renderBouquet(body) {
  const blooms = BLOOMS.map(bloomMarkup);

  const gradients = blooms
    .map((b) => b.gradient)
    .join("");

  const flowers = blooms
    .map((b) => b.markup)
    .join("");

  body.innerHTML = `
    <div class="center">
      <svg class="bq" viewBox="0 0 360 450">
        <defs>
          ${gradients}

          <radialGradient id="bg">
            <stop offset="0" stop-color="#f9c4d5" stop-opacity=".6"/>
            <stop offset="1" stop-color="#f9c4d5" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <circle
          cx="180"
          cy="190"
          r="175"
          fill="url(#bg)"
        />

        ${babysBreathMarkup()}
        ${leavesMarkup()}
        ${flowers}
        ${WRAPPING}
      </svg>

      <div class="note" id="fn"></div>
    </div>
  `;

  body.querySelectorAll("[data-i]").forEach((flower) => {
    flower.onclick = () => {
      $("fn").textContent =
        `${COMPLIMENTS[flower.dataset.i]} ♡`;
    };
  });
}


/* ---------- 7e. Cake — countdown and candles ----------------------------- */

const CAKE_SVG = [
  '<ellipse cx="130" cy="228" rx="112" ry="13" fill="#f3d9e2"/>',
  '<ellipse cx="130" cy="224" rx="104" ry="10" fill="#fff" stroke="#f3d9e2"/>',
  '<rect x="40" y="168" width="180" height="56" rx="10" fill="#fde8ef"/>',
  '<path d="M40 178q15 20 30 0t30 0 30 0 30 0 30 0 30 0v-10a10 10 0 0 0-10-10H50a10 10 0 0 0-10 10z" fill="#f6b3c7"/>',
  '<rect x="62" y="118" width="136" height="52" rx="10" fill="#fff" stroke="#f3d9e2"/>',
  '<path d="M62 128q14 18 28 0t28 0 28 0 28 0 26 0v-8a10 10 0 0 0-10-10H72a10 10 0 0 0-10 10z" fill="#e57a9c"/>',
  '<rect x="84" y="96" width="92" height="42" rx="10" fill="#fde8ef"/>',
  '<path d="M84 104q12 14 23 0t23 0 23 0 23 0v-8a8 8 0 0 0-8-8H92a8 8 0 0 0-8 8z" fill="#f6b3c7"/>',
  '<circle cx="86" cy="206" r="5" fill="#e57a9c"/>',
  '<circle cx="130" cy="210" r="5" fill="#e57a9c"/>',
  '<circle cx="176" cy="204" r="5" fill="#e57a9c"/>',
  '<path d="M60 192l4-3M104 196l4 3M150 194l4-3M196 192l3 3M96 146l5-2M124 150l4 3M152 147l5-2" stroke="#e57a9c" stroke-width="2.5" stroke-linecap="round"/>',
].join("");

function candleMarkup(x) {
  return (
    tag("rect", {
      x: x - 3,
      y: 62,
      width: 6,
      height: 34,
      rx: 2,
      fill: "#fff",
      stroke: "#f3d9e2",
    }) +

    tag("path", {
      d: `M${x - 3} 70l6 5m-6 6l6 5`,
      stroke: "#e57a9c",
      "stroke-width": 2,
    }) +

    tag("circle", {
      class: "glow",
      cx: x,
      cy: 54,
      r: 13,
      fill: "#f7d56b",
      opacity: 0.25,
    }) +

    tag("path", {
      class: "flame",
      d: `M${x} 42C${x + 6} 50 ${x + 5} 60 ${x} 61C${x - 5} 60 ${x - 6} 50 ${x} 42Z`,
      fill: "#f9b84a",
    }) +

    tag("path", {
      class: "smoke",
      d: `M${x} 56c-5-8 5-12 0-20`,
      stroke: "#cdbfc5",
      fill: "none",
      "stroke-width": 2,
    })
  );
}

function renderCake(body) {
  const COUNT_SIZE = "clamp(80px, 26vw, 130px)";
  const TITLE_SIZE = "clamp(44px, 14vw, 76px)";

  let started = false;
  let timer = null;

  body.innerHTML = `
    <div class="center">
      <div class="big" id="cn"></div>

      <div class="sub" id="cs"></div>

      <svg
        id="ck"
        viewBox="0 0 260 250"
        style="width:min(320px,86%)"
      >
        ${CAKE_SVG}
        ${[104, 130, 156].map(candleMarkup).join("")}
      </svg>

      <div class="row" style="margin-top:16px;justify-content:center">
        <button
          class="fill"
          id="go"
          style="width:100%;max-width:320px;min-height:54px;font-size:16px"
        >
          Press when you’re ready to blow :)
        </button>
      </div>
    </div>
  `;

  const showBig = (html, size) => {
    const el = $("cn");

    if (!el) return;

    el.className = "big";

    void el.offsetWidth;

    el.className = "big pop";
    el.style.fontSize = size;
    el.innerHTML = html;
  };

  const blowOutCandles = () => {
    $("ck").classList.add("out");

    showBig("Happy<br>Birthday!", TITLE_SIZE);

    $("cs").textContent =
      "may every wish come true ♡";

    confetti();
  };

  $("go").onclick = () => {
    if (started) return;

    started = true;

    $("go").style.display = "none";

    let count = 5;

    showBig(count, COUNT_SIZE);

    timer = setInterval(() => {
      count--;

      if (!$("cn")) {
        clearInterval(timer);
        return;
      }

      if (count > 0) {
        showBig(count, COUNT_SIZE);
        return;
      }

      clearInterval(timer);

      blowOutCandles();

    }, 1000);
  };

  return () => clearInterval(timer);
}


/* ---------- 8. Dashboard & sheet ---------------------------------------- */

const PANELS = {
  letter: renderLetter,
  gallery: renderGallery,
  music: renderMusic,
  flower: renderBouquet,
  cake: renderCake,
};

let cleanupPanel = () => {};

function openPanel(card) {
  cleanupPanel();

  if (card.id === "gallery") {
    // Open memory PIN modal
    $("memory-pin-modal").classList.add("show");
    initPinPad(
      "memory-pin-container", 
      "memory-dots", 
      "OUR MEMORIES", 
      "ENTER MEMORY PIN", 
      MEMORY_PIN, 
      () => {
        $("memory-pin-modal").classList.remove("show");
        launchGalleryPanel(card);
      },
      () => {
        $("memory-pin-modal").classList.remove("show");
      }
    );
    return;
  }

  launchGalleryPanel(card);
}

function launchGalleryPanel(card) {
  $("st").textContent = card.title;
  $("body").innerHTML = "";

  cleanupPanel =
    PANELS[card.id]($("body")) || (() => {});

  $("sheet").classList.add("show");
}

function closePanel() {
  cleanupPanel();

  cleanupPanel = () => {};

  $("sheet").classList.remove("show");

  $("body").innerHTML = "";
}

function initDashboard() {
  CARDS.forEach((card, i) => {
    const button = document.createElement("button");

    button.className = "card";

    button.innerHTML = `
      <span>0${i + 1}</span>
      <div>
        <b></b>
        <em></em>
      </div>
    `;

    button.querySelector("b").textContent =
      card.title;

    button.querySelector("em").textContent =
      card.hint;

    button.onclick = () => openPanel(card);

    $("list").appendChild(button);
  });

  $("x").onclick = closePanel;

  $("sheet").onclick = (event) => {
    if (event.target === $("sheet")) {
      closePanel();
    }
  };

  $("lbc").onclick = closeLightbox;

  $("lightbox").onclick = (event) => {
    if (event.target !== $("lbi")) {
      closeLightbox();
    }
  };

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (dismissConfirm) {
      dismissConfirm();

    } else if (
      $("lightbox").classList.contains("show")
    ) {
      closeLightbox();

    } else if (
      $("sheet").classList.contains("show")
    ) {
      closePanel();
    }
  });
}


/* ---------- Start -------------------------------------------------------- */

initLock();
initDashboard();

/* ==========================================================================
   Birthday website — script.js

   Sections:
   1. Settings
   2. Helpers
   3. Supabase
   4. Photo data
   4b. Photo viewer + delete confirmation
   5. Lock screen
   6. Loading screen
   7. Panels (letter, gallery, music, bouquet, cake)
   8. Dashboard & sheet
   ========================================================================== */


/* ---------- 1. Settings ------------------------------------------------- */

const PIN = "0407"; // Change the 4-digit PIN here

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

/**
 * Builds an SVG/HTML tag string.
 */
function tag(name, attrs = {}, inner = "") {
  const attributes = Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");

  return `<${name}${attributes}>${inner}</${name}>`;
}

/**
 * Drops a burst of pink confetti over the whole screen.
 */
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

/**
 * Pops a circular bubble inside a container.
 */
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

/**
 * Loads every saved memory from the database.
 */
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

/**
 * Uploads the photo to Storage and saves its information in the database.
 * Returns { src, id, path }.
 *
 * IMPORTANT:
 * This function only performs ONE database insert.
 */
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

  // 1. Upload image to Supabase Storage.
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
    // 2. Save the image information to the database ONCE.
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
    // Remove the uploaded file if the database save fails.
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

/**
 * Deletes a saved photo from Storage and its database row.
 */
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

  // 1. Delete image from Storage.
  const file = await fetch(
    `${SUPABASE.url}/storage/v1/object/${SUPABASE.bucket}/${encodedPath}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );

  if (!file.ok) {
    const errorText = await file.text();

    // If the image is already missing, continue deleting its database row.
    if (
      file.status !== 404 ||
      !errorText.toLowerCase().includes("not_found")
    ) {
      throw new Error(`Storage deletion failed: ${errorText}`);
    }

    console.warn(
      "Image was already missing from Storage:",
      item.path
    );
  }

  // 2. Delete database record.
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

// photos["1st Meetup"] = [{ src, caption, id, path }, ...]
//
// Entries without src are placeholders.
// They are hidden once real photos exist in that category.

const photos = {};

CATEGORIES.forEach((category) => {
  photos[category] = [
    { caption: `${category} ♡` },
    { caption: "A sweet moment" },
  ];
});


/* ---------- 4b. Photo viewer + delete confirmation ---------------------- */

let dismissConfirm = null;

/**
 * Opens the photo viewer.
 */
function openLightbox(item) {
  $("lbi").src = item.src;
  $("lbt").textContent = item.caption || "";

  $("lightbox").classList.add("show");
}

/**
 * Closes the photo viewer.
 */
function closeLightbox() {
  $("lightbox").classList.remove("show");
  $("lbi").removeAttribute("src");
}

/**
 * Shows the delete confirmation dialog.
 * Resolves true when confirmed, false when cancelled.
 */
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


/* ---------- 5. Lock screen ---------------------------------------------- */

function initLock() {
  const keys = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    "", "0", "⌫",
  ];

  const dots = [...$("dots").children];

  let entered = "";

  const renderDots = () => {
    dots.forEach((dot, i) => {
      dot.classList.toggle("on", i < entered.length);
    });
  };

  const checkPin = () => {
    if (entered === PIN) {
      startLoading();
      $("lock").classList.add("hide");
      return;
    }

    $("lb").classList.add("shake");

    setTimeout(() => {
      $("lb").classList.remove("shake");
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

    $("pad").appendChild(button);
  });
}


/* ---------- 6. Loading screen ------------------------------------------- */

const LOADING_MESSAGES = [
  "I love you so much baby…",
  "MWAAAAAA",
  "Patience is virtue",
  "almost there babyy♡",
];

const MIN_LOADING_MS = 3800;

async function startLoading() {
  const screen = $("load");

  // Show instantly so the dashboard never flashes through.
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

  // Photo bubbles behind the progress bar.
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

  const bubbleTimer = setInterval(spawn, 320);

  spawn();

  // Load saved photos and preload their images.
  const loadPhotos = async () => {
    if (supabaseReady()) {
      try {
        const rows = await fetchMemories();

        // Prevent duplicate gallery entries if the database contains
        // repeated IDs or Storage paths.
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

  // Start loading photos.
  const photoLoading = loadPhotos();

  // Animate the 0–100% bar.
  let shown = 0;

  const tick = () => {
    const timePart = Math.min(
      1,
      (performance.now() - startedAt) / MIN_LOADING_MS
    );

    const dataPart = progress.done / progress.total;

    const target = Math.min(timePart, dataPart) * 100;

    shown = Math.min(
      target,
      shown + Math.max(0.35, (target - shown) * 0.08)
    );

    const percent = Math.floor(shown);

    $("pc").textContent = `${percent}%`;
    $("bf").style.width = `${shown}%`;

    $("lm").textContent =
      percent >= 100
        ? "welcome, my love ♡"
        : LOADING_MESSAGES[
            Math.min(3, Math.floor(shown / 26))
          ];

    if (shown >= 99.9) {
      clearInterval(bubbleTimer);

      $("pc").textContent = "100%";
      $("bf").style.width = "100%";

      setTimeout(() => {
        screen.classList.add("hide");
      }, 650);

    } else {
      requestAnimationFrame(tick);
    }
  };

  // Do not allow the loading screen to finish before photos finish loading.
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

  const paragraphs = LETTER.split("\n\n");

  let index = 0;
  const timer = setInterval(() => {
    letter.textContent = LETTER.slice(0, ++index);

    if (index >= LETTER.length) {
      clearInterval(timer);
    }
  }, 40);

  return () => clearInterval(timer);
}


/* ---------- 7b. Gallery — tabs, photo grid and upload form --------------- */

function renderGallery(body) {
  let currentTab = CATEGORIES[0];
  let chosenCategory = CATEGORIES[0];

  let chosenFile = null;
  let isUploading = false;
  let previewUrl = null;

  const dropContent = (title, hint) => `
    <input type="file" id="uf" accept="image/jpeg,image/png,image/webp" hidden>
    <span class="plus">+</span>
    <b>${title}</b>
    ${hint}
  `;

  body.innerHTML = `
    <div class="tabs" id="tb"></div>

    <div class="ph" id="ph"></div>

    <div class="up">
      <h4>Add a memory</h4>

      <label class="drop" id="dr">
        ${dropContent(
          "Choose a photo",
          "tap here or drop one in"
        )}
      </label>

      <div class="chips" id="ch"></div>

      <input
        type="text"
        id="ucap"
        placeholder="Write a little caption"
        maxlength="60"
      >

      <button class="fill" id="ud">
        Add to gallery
      </button>

      <p id="us"></p>
    </div>
  `;

  const dropZone = $("dr");

  /**
   * Renders category buttons.
   */
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

  /**
   * Renders gallery tabs.
   */
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

  /**
   * Renders upload category chips.
   */
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

  /**
   * Renders the photos for the selected category.
   */
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
        // Open photo viewer.
        tile.onclick = () => openLightbox(item);

        // Delete button.
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

  /**
   * Deletes a photo after confirmation.
   */
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

      // Find the correct category instead of relying on the current tab.
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

  /**
   * Releases the previous temporary preview URL.
   */
  const clearPreviewUrl = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
  };

  /**
   * Displays the selected photo in the drop zone.
   */
  const choosePhoto = (file) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      $("us").textContent =
        "Please choose a JPG, PNG, or WEBP image.";

      return;
    }

    clearPreviewUrl();

    chosenFile = file;

    previewUrl = URL.createObjectURL(file);

    dropZone.innerHTML = `
      <img
        alt="Selected photo preview"
        src="${previewUrl}"
      >
    `;

    $("us").textContent = "";
  };

  /**
   * Reconnects the file input after resetting the drop zone.
   */
  const bindFileInput = () => {
    const input = $("uf");

    if (!input) return;

    input.onchange = (event) => {
      choosePhoto(event.target.files[0]);
    };
  };

  // Drag and drop.
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

    choosePhoto(event.dataTransfer.files[0]);
  };

  /**
   * Uploads a photo.
   *
   * This is the ONLY upload handler.
   * saveMemory() is called exactly once per successful click.
   */
  $("ud").onclick = async () => {
    const status = $("us");
    const button = $("ud");

    // Prevent double-clicking and repeated uploads.
    if (isUploading) return;

    if (!chosenFile) {
      status.textContent = "Choose a photo first.";
      return;
    }

    if (!supabaseReady()) {
      status.textContent = "Supabase is not connected.";
      return;
    }

    const file = chosenFile;
    const category = chosenCategory;

    const caption =
      $("ucap").value.trim() || ":))";

    isUploading = true;

    button.disabled = true;
    button.textContent = "Saving...";

    status.textContent = "Uploading your memory...";

    try {
      // Save to Supabase ONCE.
      const saved = await saveMemory(
        file,
        category,
        caption
      );

      // Prevent the same record from appearing twice in the gallery.
      const alreadyExists = photos[category].some(
        (item) =>
          item.id === saved.id ||
          item.path === saved.path
      );

      if (!alreadyExists) {
        photos[category].push({
          src: saved.src,
          id: saved.id,
          path: saved.path,
          caption,
        });
      }

      // Show the category where the new photo was uploaded.
      currentTab = category;

      renderTabs();
      renderChips();
      renderGrid();

      status.textContent = "Memory successfully saved! ♡";

      // Reset upload fields.
      chosenFile = null;

      clearPreviewUrl();

      $("ucap").value = "";

      dropZone.innerHTML = dropContent(
        "Choose another photo",
        "tap here or drop one in"
      );

      bindFileInput();

    } catch (error) {
      console.error("Upload error:", error);

      status.textContent =
        `Upload failed: ${error.message}`;

    } finally {
      isUploading = false;

      button.disabled = false;
      button.textContent = "Add to gallery";
    }
  };

  // Initial gallery setup.
  bindFileInput();

  renderTabs();
  renderChips();
  renderGrid();

  // Release temporary preview URL if the panel is closed.
  return () => {
    clearPreviewUrl();
  };
}


/* ---------- 7c. Soundtrack — synthesized melody + photo bubbles ---------- */

/* ---------- 7c. Soundtrack — MP3 player + photo bubbles ------------------ */

function renderMusic(body) {
  let playing = false;
  let bubbleTimer = null;

  // Load the actual MP3 file.
  const audio = new Audio("./audio/my-heart-it-beats.mp3");

  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.8;

  // Render the music interface only once.
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

  // Start the song at 10 seconds.
  const seekToStart = () => {
    if (Number.isFinite(audio.duration) && audio.duration > 10) {
      audio.currentTime = 10;
    } else if (Number.isFinite(audio.duration)) {
      audio.currentTime = 0;
    }
  };

  // Wait for the MP3 metadata before setting the starting position.
  audio.addEventListener("loadedmetadata", seekToStart, {
    once: true
  });

  // Create floating photo bubbles.
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

  // Start playback.
  const startPlayback = async () => {
    try {
      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        seekToStart();
      } else {
        // Queue the seek until metadata is available.
        audio.currentTime = 10;
      }

      await audio.play();

      playing = true;

      vinyl.classList.add("sp");
      button.textContent = "Pause Music";
      status.textContent = "playing....";

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

  // Pause playback.
  const stopPlayback = () => {
    audio.pause();

    playing = false;

    vinyl.classList.remove("sp");

    button.textContent = "Play Music";
    status.textContent = "paused ♡";

    clearInterval(bubbleTimer);
    bubbleTimer = null;
  };

  // Play/Pause button.
  button.addEventListener("click", async () => {
    if (playing) {
      stopPlayback();
    } else {
      await startPlayback();
    }
  });

  // Update the interface if the song ends.
  audio.addEventListener("ended", () => {
    playing = false;

    vinyl.classList.remove("sp");

    button.textContent = "Play Music";
    status.textContent = "song finished ♡";

    clearInterval(bubbleTimer);
    bubbleTimer = null;
  });

  // Handle missing or invalid MP3 files.
  audio.addEventListener("error", () => {
    console.error("Audio file could not be loaded:", audio.src);

    status.textContent =
      "Couldn't load the song. Check the MP3 path.";
  });

  // Cleanup when the music panel is closed.
  return () => {
    stopPlayback();

    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  };
}


/* ---------- 7d. Bouquet — roses, peonies and daisies --------------------- */

// [x, y, radius, type, [centre colour, edge colour]]

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

// [x, y, rotation]

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

/**
 * Creates leaves.
 */
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

/**
 * Creates baby's breath flowers.
 */
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

/**
 * Creates one flower.
 */
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

/**
 * Pink wrapping paper, ribbon and bow.
 */
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

/**
 * Renders the bouquet.
 */
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

/**
 * Creates one candle.
 */
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

/**
 * Renders the birthday cake.
 */
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

  /**
   * Replaces the big text and restarts its animation.
   */
  const showBig = (html, size) => {
    const el = $("cn");

    if (!el) return;

    el.className = "big";

    void el.offsetWidth;

    el.className = "big pop";
    el.style.fontSize = size;
    el.innerHTML = html;
  };

  /**
   * Blows out the candles.
   */
  const blowOutCandles = () => {
    $("ck").classList.add("out");

    showBig("Happy<br>Birthday BABY!!!!!", TITLE_SIZE);

    $("cs").textContent =
      "may every wish come true";

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

/**
 * Opens a panel.
 */
function openPanel(card) {
  cleanupPanel();

  $("st").textContent = card.title;

  $("body").innerHTML = "";

  cleanupPanel =
    PANELS[card.id]($("body")) || (() => {});

  $("sheet").classList.add("show");
}

/**
 * Closes the current panel.
 */
function closePanel() {
  cleanupPanel();

  cleanupPanel = () => {};

  $("sheet").classList.remove("show");

  $("body").innerHTML = "";
}

/**
 * Initializes the dashboard.
 */
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

  // Close panel button.
  $("x").onclick = closePanel;

  // Close panel by clicking the backdrop.
  $("sheet").onclick = (event) => {
    if (event.target === $("sheet")) {
      closePanel();
    }
  };

  // Close photo viewer button.
  $("lbc").onclick = closeLightbox;

  // Close photo viewer by clicking outside the image.
  $("lightbox").onclick = (event) => {
    if (event.target !== $("lbi")) {
      closeLightbox();
    }
  };

  // Escape closes the top-most open element.
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












      // ---- Quest data: each task is a short "find ..." prompt with an image.
      var QUESTS = [
        // ---- Inside the house ----
        {
          zone: "indoor",
          text: "Find something soft.",
          hint: "You could cuddle it on the sofa.",
          img: "https://res.cloudinary.com/dmkhsyfzf/image/upload/c_crop,w_469,h_384,x_469,y_0/v1787862604/A-F_k9jjst.png",
          icon: "https://res.cloudinary.com/dmkhsyfzf/image/upload/c_crop,w_469,h_384,x_469,y_0/v1787862604/A-F_k9jjst.png",
          alt: "Soft bear"
        },
        {
          zone: "indoor",
          text: "Find something you can read.",
          hint: "It has lots of pages.",
          img: "https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_424,h_421,x_424,y_842/v1786261038/book_pencil_v8ipxw.png",
          icon: "https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_424,h_421,x_424,y_842/v1786261038/book_pencil_v8ipxw.png",
          alt: "Book"
        },
        {
          zone: "indoor",
          text: "Find something round.",
          hint: "It lives in your kitchen or toy box.",
          img: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_421,y_424/v1786599929/260813_toys_01_txjh3y.png",
          icon: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_421,y_424/v1786599929/260813_toys_01_txjh3y.png",
          alt: "Round toy"
        },
        {
          zone: "indoor",
          text: "Find something that keeps you warm.",
          hint: "You sleep under it.",
          img: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_0,y_424/v1786599929/260813_toys_01_txjh3y.png",
          icon: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_0,y_424/v1786599929/260813_toys_01_txjh3y.png",
          alt: "Robot bear"
        },
        {
          zone: "indoor",
          text: "Find where you eat.",
          hint: "You sit here with your family.",
          img: "https://res.cloudinary.com/dmkhsyfzf/image/upload/f_auto,q_auto/v1787859944/house-home-cropped_y3kapx.jpg",
          icon: "https://res.cloudinary.com/dmkhsyfzf/image/upload/c_crop,w_281,h_384,x_0,y_0/v1788284552/verbs_qnipqh.jpg",
          alt: "Table"
        },
        {
          zone: "indoor",
          text: "Find something that lets you see outside.",
          hint: "It has a window.",
          img: "https://res.cloudinary.com/dmkhsyfzf/image/upload/c_crop,w_281,h_384,x_562,y_0/v1788284552/verbs_qnipqh.jpg",
          icon: "https://res.cloudinary.com/dmkhsyfzf/image/upload/c_crop,w_281,h_384,x_562,y_0/v1788284552/verbs_qnipqh.jpg",
          alt: "Window"
        },
        {
          zone: "indoor",
          text: "Find your favourite toy.",
          hint: "What do you play with the most?",
          img: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_0,y_0/v1786599929/260813_toys_01_txjh3y.png",
          icon: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_0,y_0/v1786599929/260813_toys_01_txjh3y.png",
          alt: "Car"
        },
        {
          zone: "indoor",
          text: "Find something you drink from.",
          hint: "It holds your juice or water.",
          img: "https://res.cloudinary.com/dmkhsyfzf/image/upload/c_crop,w_281,h_384,x_0,y_384/v1788284552/verbs_qnipqh.jpg",
          icon: "https://res.cloudinary.com/dmkhsyfzf/image/upload/c_crop,w_281,h_384,x_0,y_384/v1788284552/verbs_qnipqh.jpg",
          alt: "Cup"
        },
        // ---- Outside the house ----
        {
          zone: "outdoor",
          text: "Find something green outside.",
          hint: "It grows in the garden.",
          img: "https://res.cloudinary.com/dmkhsyfzf/image/upload/c_crop,w_281,h_384,x_562,y_384/v1788284552/verbs_qnipqh.jpg",
          icon: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_469,h_384,x_938,y_0/v1786050302/A-F_yhrs9s.png",
          alt: "Plant"
        },
        {
          zone: "outdoor",
          text: "Find something you can ride outside.",
          hint: "It has two wheels.",
          img: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_421,y_424/v1786599929/260813_toys_01_txjh3y.png",
          icon: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_421,y_424/v1786599929/260813_toys_01_txjh3y.png",
          alt: "Bike"
        },
        {
          zone: "outdoor",
          text: "Find something the birds use.",
          hint: "They rest on bushy things.",
          img: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_469,h_384,x_0,y_384/v1786050302/A-F_yhrs9s.png",
          icon: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_469,h_384,x_0,y_384/v1786050302/A-F_yhrs9s.png",
          alt: "Tree"
        },
        {
          zone: "outdoor",
          text: "Find something you can throw and catch.",
          hint: "It is round and bouncy.",
          img: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_842,y_0/v1786599929/260813_toys_01_txjh3y.png",
          icon: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_842,y_0/v1786599929/260813_toys_01_txjh3y.png",
          alt: "Ball"
        },
        {
          zone: "outdoor",
          text: "Find something that gives shade.",
          hint: "You stand under it when it is hot.",
          img: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_469,h_384,x_469,y_384/v1786050302/A-F_yhrs9s.png",
          icon: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_469,h_384,x_469,y_384/v1786050302/A-F_yhrs9s.png",
          alt: "Shade tree"
        },
        {
          zone: "outdoor",
          text: "Find something that grows in the soil.",
          hint: "It can be green or colourful.",
          img: "https://res.cloudinary.com/dmkhsyfzf/image/upload/c_crop,w_281,h_384,x_281,y_0/v1788284552/verbs_qnipqh.jpg",
          icon: "https://res.cloudinary.com/dmkhsyfzf/image/upload/c_crop,w_281,h_384,x_281,y_0/v1788284552/verbs_qnipqh.jpg",
          alt: "Flower"
        },
        {
          zone: "outdoor",
          text: "Find something that flies in the sky.",
          hint: "It can be a bird or a plane.",
          img: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_842,y_424/v1786599929/260813_toys_01_txjh3y.png",
          icon: "https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_421,h_424,x_842,y_424/v1786599929/260813_toys_01_txjh3y.png",
          alt: "Kite"
        }
      ];

      // ---- App state ----
      // ?q=N (1-based) opens straight at quest N, so a QR can point straight
      // to a specific quest. Without a param we start at quest 1.
      var current = 0;
      var done = [];

      // ---- Screens ----
      var $ = function (id) {
        return document.getElementById(id);
      };
      function show(id) {
        document.querySelectorAll(".screen").forEach(function (s) {
          s.classList.remove("active");
        });
        $(id).classList.add("active");
        window.scrollTo(0, 0);
      }

      // ---- Theme toggle ----
      (function () {
        var d = document.documentElement;
        var theme = "system";
        try {
          var saved = localStorage.getItem("questTheme");
          if (saved === "dark" || saved === "light") theme = saved;
        } catch (e) {}
        var mq = window.matchMedia("(prefers-color-scheme: dark)");
        function apply() {
          var dark = theme === "dark" || (theme === "system" && mq.matches);
          d.classList.toggle("dark", dark);
          $("themeToggle").textContent = dark ? "☀️" : "🌙";
        }
        apply();
        if (mq.addEventListener) mq.addEventListener("change", apply);
        else if (mq.addListener) mq.addListener(apply);
        $("themeToggle").addEventListener("click", function () {
          theme = theme === "dark" ? "light" : "dark";
          try {
            localStorage.setItem("questTheme", theme);
          } catch (e) {}
          apply();
        });
      })();

      // ---- Build the classroom QR ----
      // Points at this page. If you deploy it, put the live URL here so the
      // code scans to the hosted page (e.g. https://example.com/junior/others/indoor-outdoor-quest.html)
      var DEPLOY_URL = null; // null = use the current page URL.
      function questUrl(index) {
        var base = DEPLOY_URL || location.origin + location.pathname;
        return base + "?q=" + (index + 1);
      }

      function buildQr() {
        // qrserver renders a real scannable QR as an image (no JS lib needed).
        var data = encodeURIComponent(questUrl(0));
        $("qrImg").src =
          "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=" +
          data;
        var u = questUrl(0);
        $("qrUrl").textContent =
          "Decodes to: " + u.replace("?q=", "  →  quest ");
      }

      // ---- Render a quest ----
      function renderQuest() {
        var q = QUESTS[current];
        var band = $("questBand");
        band.classList.toggle("outdoor", q.zone === "outdoor");
        var pill = $("zonePill");
        pill.textContent = q.zone === "indoor" ? "Inside 🏠" : "Outside 🌳";
        pill.className = "pill " + q.zone;
        $("questImg").src = q.img;
        $("questImg").alt = q.alt || "";
        $("questText").textContent = q.text;
        $("questText").classList.add("has-img");
        $("questHint").textContent = q.hint;
        $("counter").textContent =
          "Quest " + (current + 1) + " of " + QUESTS.length;
        show("screen-quest");
      }

      function advance() {
        if (current < QUESTS.length - 1) {
          current++;
          renderQuest();
        } else {
          renderDone();
        }
      }

      function renderDone() {
        var list = $("doneList");
        list.innerHTML = "";
        QUESTS.forEach(function (q) {
          var row = document.createElement("div");
          row.className = "mini" + (q.zone === "outdoor" ? " outdoor" : "");
          row.innerHTML =
            '<img src="' +
            q.icon +
            '" alt=""/>' +
            '<div><div class="mini-t">' +
            q.text +
            '</div><div class="mini-s">' +
            (q.zone === "indoor" ? "Inside the house" : "Outside the house") +
            "</div></div>" +
            '<span class="done-mark">✓</span>';
          list.appendChild(row);
        });
        show("screen-done");
      }

      // ---- Wiring ----
      function reset() {
        current = 0;
        done = [];
        renderQuest();
      }

      $("startBtn").addEventListener("click", function () {
        // On the teacher device, also allow starting straight through.
        reset();
      });
      $("nextBtn").addEventListener("click", advance);
      $("againBtn").addEventListener("click", function () {
        current = 0;
        show("screen-start");
      });

      // ---- Boot ----
      buildQr();
      var qp = new URLSearchParams(location.search).get("q");
      if (qp) {
        var n = parseInt(qp, 10);
        if (!isNaN(n) && n >= 1 && n <= QUESTS.length) {
          current = n - 1;
          renderQuest();
        } else {
          renderQuest();
        }
      } else {
        show("screen-start");
      }
    
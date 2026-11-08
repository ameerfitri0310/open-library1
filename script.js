
const searchAPI = "https://openlibrary.org/search.json";
const bookAPI = "https://openlibrary.org/books/OL7353617M.json";
const listAPI = "https://openlibrary.org/books/OL1M/lists.json";

const booksDiv = document.getElementById("books");
const message = document.getElementById("message");

// API 1: Get featured book details
async function loadFeatured() {
    const box = document.getElementById("featured");

    try {
        const response = await fetch(bookAPI);
        if (!response.ok) throw new Error("Failed to load book");

        const book = await response.json();

        box.innerHTML = `
            <h3>${book.title || "Unknown Title"}</h3>
            <p>Book ID: ${book.key || "N/A"}</p>
            <p>Publishers: ${
                book.publishers?.join(", ") || "N/A"
            }</p>
        `;
    } catch (error) {
        box.textContent = "Unable to load featured book.";
    }
}

// API 2: Search books
async function searchBooks() {
    const query = document.getElementById("search").value.trim();
    const category = document.getElementById("category").value;
    const year = document.getElementById("year").value;

    booksDiv.innerHTML = "";
    message.textContent = "Loading sabaq sat books...";

    const params = new URLSearchParams({
        q: query || "popular books",
        limit: "20"
    });

    if (category) params.set("subject", category);
    if (year) params.set("first_publish_year", year);

    try {
        const response = await fetch(
            `${searchAPI}?${params.toString()}`
        );

        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();

        if (!data.docs || data.docs.length === 0) {
            message.textContent = "No books found.";
            return;
        }

        message.textContent = `${data.docs.length} books found`;

        data.docs.forEach(book => {
            const card = document.createElement("div");
            card.className = "book";

            const title = book.title || "Unknown Title";
            const author = book.author_name?.join(", ") || "Unknown";
            const year = book.first_publish_year || "N/A";
            const isbn = book.isbn?.[0] || "N/A";
            const cover = book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                : "";

            card.innerHTML = `
                ${cover ? `<img src="${cover}" alt="Book cover">` : ""}
                <h3></h3>
                <p class="author"></p>
                <p>Year: ${year}</p>
                <p>ISBN: ${isbn}</p>
                <button class="details">View Details</button>
                <div class="extra" hidden></div>
            `;

            card.querySelector("h3").textContent = title;
            card.querySelector(".author").textContent =
                "Author: " + author;

            card.querySelector(".details").onclick = () => {
                const extra = card.querySelector(".extra");
                extra.hidden = !extra.hidden;
                extra.textContent = extra.hidden
                    ? ""
                    : `Title: ${title} | Author: ${author} | Year: ${year} | ISBN: ${isbn}`;
            };

            booksDiv.appendChild(card);
        });
    } catch (error) {
        message.textContent =
            "Error loading books. Please check your internet and try again.";
    }
}

// API 3: Get lists connected to a book
async function loadLists() {
    const box = document.getElementById("lists");

    try {
        const response = await fetch(listAPI);
        if (!response.ok) throw new Error("Failed to load lists");

        const data = await response.json();
        const lists = data.entries || data.lists || [];

        if (lists.length === 0) {
            box.textContent = "No book lists available.";
            return;
        }

        box.innerHTML = "";
        lists.slice(0, 10).forEach(item => {
            const p = document.createElement("p");
            p.textContent = item.name || item.title || item.url || "Book list";
            box.appendChild(p);
        });
    } catch (error) {
        box.textContent =
            "Unable to load book lists. Please try again later.";
    }
}

// Search when Enter is pressed
document.getElementById("search").addEventListener("keydown", event => {
    if (event.key === "Enter") searchBooks();
});

// Load all sections
searchBooks();
loadFeatured();
loadLists();

/* ============================================
   MiniSocial - JavaScript
   Handles likes, comments, follows, and search
   using the Fetch API for dynamic updates
   ============================================ */

(function () {
    "use strict";

    // Helper: get CSRF token from a form's hidden input
    function getCSRFToken(form) {
        return form.querySelector('[name="csrfmiddlewaretoken"]').value;
    }

    // Helper: get CSRF token from cookie (for non-form requests)
    function getCSRFCookie() {
        const cookies = document.cookie.split(";");
        for (let c of cookies) {
            c = c.trim();
            if (c.startsWith("csrftoken=")) {
                return c.substring("csrftoken=".length);
            }
        }
        return "";
    }

    // ============================================
    // Like / Unlike Posts
    // ============================================
    function initLikeButtons() {
        document.addEventListener("click", function (e) {
            const btn = e.target.closest(".like-btn");
            if (!btn) return;

            const postId = btn.dataset.postId;
            const url = `/api/post/${postId}/like/`;

            fetch(url, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFCookie(),
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        alert(data.error);
                        return;
                    }
                    const likeText = btn.querySelector(".like-text");
                    const likeCount = btn.querySelector(".like-count");

                    if (data.liked) {
                        btn.classList.add("liked");
                        likeText.textContent = "Unlike";
                    } else {
                        btn.classList.remove("liked");
                        likeText.textContent = "Like";
                    }
                    likeCount.textContent = data.like_count;
                })
                .catch(() => alert("Something went wrong. Please try again."));
        });
    }

    // ============================================
    // Add Comments
    // ============================================
    function initCommentForms() {
        document.addEventListener("submit", function (e) {
            const form = e.target.closest(".comment-form");
            if (!form) return;
            e.preventDefault();

            const postId = form.dataset.postId;
            const input = form.querySelector(".comment-input");
            const text = input.value.trim();
            if (!text) return;

            const url = `/api/post/${postId}/comment/`;
            const formData = new FormData();
            formData.append("text", text);

            fetch(url, {
                method: "POST",
                headers: { "X-CSRFToken": getCSRFToken(form) },
                body: formData,
            })
                .then((res) => {
                    if (res.status === 400) {
                        return res.json().then((d) => { throw new Error(d.error || "Invalid comment"); });
                    }
                    return res.json();
                })
                .then((data) => {
                    if (data.error) {
                        alert(data.error);
                        return;
                    }
                    const commentsContainer = document.querySelector(
                        `.comments-display[data-post-id="${postId}"]`
                    );
                    // Remove "no comments" text if present
                    const noComments = commentsContainer.querySelector(".no-comments");
                    if (noComments) noComments.remove();

                    const commentEl = document.createElement("div");
                    commentEl.className = "comment-item";
                    commentEl.dataset.commentId = data.id;
                    commentEl.innerHTML = `
                        <img src="${data.profile_picture}" alt="avatar" class="comment-avatar">
                        <div class="comment-body">
                            <strong>${escapeHtml(data.username)}</strong>
                            <span class="comment-text">${escapeHtml(data.text)}</span>
                            <span class="comment-date">${data.created_at}</span>
                        </div>
                        <button class="btn btn-danger btn-xs delete-comment-btn" data-comment-id="${data.id}">Delete</button>
                    `;
                    commentsContainer.appendChild(commentEl);
                    input.value = "";
                })
                .catch((err) => alert(err.message || "Failed to add comment."));
        });
    }

    // ============================================
    // Delete Comments
    // ============================================
    function initDeleteCommentButtons() {
        document.addEventListener("click", function (e) {
            const btn = e.target.closest(".delete-comment-btn");
            if (!btn) return;
            e.preventDefault();

            if (!confirm("Delete this comment?")) return;

            const commentId = btn.dataset.commentId;
            const url = `/api/comment/${commentId}/delete/`;

            fetch(url, {
                method: "POST",
                headers: { "X-CSRFToken": getCSRFCookie() },
            })
                .then((res) => {
                    if (res.status === 403) {
                        throw new Error("You can only delete your own comments.");
                    }
                    return res.json();
                })
                .then((data) => {
                    if (data.error) {
                        alert(data.error);
                        return;
                    }
                    const commentEl = document.querySelector(
                        `.comment-item[data-comment-id="${commentId}"]`
                    );
                    if (commentEl) commentEl.remove();
                })
                .catch((err) => alert(err.message || "Failed to delete comment."));
        });
    }

    // ============================================
    // Follow / Unfollow
    // ============================================
    function initFollowButtons() {
        document.addEventListener("click", function (e) {
            const btn = e.target.closest(".follow-btn");
            if (!btn) return;

            const username = btn.dataset.username;
            const isFollowing = btn.dataset.following === "true";
            const url = `/api/follow/${username}/`;
            const formData = new FormData();
            formData.append("action", isFollowing ? "unfollow" : "follow");

            fetch(url, {
                method: "POST",
                headers: { "X-CSRFToken": getCSRFCookie() },
                body: formData,
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        alert(data.error);
                        return;
                    }
                    if (data.followed) {
                        btn.classList.remove("btn-primary");
                        btn.classList.add("btn-secondary");
                        btn.textContent = "Following";
                        btn.dataset.following = "true";
                    } else {
                        btn.classList.remove("btn-secondary");
                        btn.classList.add("btn-primary");
                        btn.textContent = "Follow";
                        btn.dataset.following = "false";
                    }
                    // Update followers count on profile page
                    const followersEl = document.querySelector(".stat-item strong");
                    const statItems = document.querySelectorAll(".stat-item strong");
                    statItems.forEach((el) => {
                        const parent = el.closest("a");
                        if (parent && parent.href.includes("/followers/")) {
                            el.textContent = data.followers_count;
                        }
                    });
                })
                .catch(() => alert("Something went wrong. Please try again."));
        });
    }

    // ============================================
    // Search - Navbar live search
    // ============================================
    function initNavbarSearch() {
        const input = document.getElementById("nav-search-input");
        const results = document.getElementById("nav-search-results");
        if (!input || !results) return;

        let debounceTimer;

        input.addEventListener("input", function () {
            clearTimeout(debounceTimer);
            const query = this.value.trim();

            if (query.length < 1) {
                results.classList.remove("visible");
                results.innerHTML = "";
                return;
            }

            debounceTimer = setTimeout(() => {
                fetch(`/api/search/?q=${encodeURIComponent(query)}`)
                    .then((res) => res.json())
                    .then((data) => {
                        results.innerHTML = "";
                        if (data.users.length === 0) {
                            results.innerHTML = '<div class="nav-search-result-item"><span class="nav-search-result-info"><strong>No users found</strong></span></div>';
                        } else {
                            data.users.forEach((u) => {
                                const item = document.createElement("a");
                                item.href = `/profile/${u.username}/`;
                                item.className = "nav-search-result-item";
                                item.innerHTML = `
                                    <img src="${u.profile_picture}" alt="${u.username}">
                                    <div class="nav-search-result-info">
                                        <strong>${escapeHtml(u.username)}</strong>
                                        <span>${escapeHtml(u.full_name)}</span>
                                    </div>
                                `;
                                results.appendChild(item);
                            });
                        }
                        results.classList.add("visible");
                    })
                    .catch(() => {});
            }, 250);
        });

        // Hide results when clicking outside
        document.addEventListener("click", function (e) {
            if (!e.target.closest(".navbar-search-box")) {
                results.classList.remove("visible");
            }
        });
    }

    // ============================================
    // Search - Full search page
    // ============================================
    function initSearchPage() {
        const input = document.getElementById("search-input");
        const resultsContainer = document.getElementById("search-results");
        const emptyState = document.getElementById("search-empty");
        if (!input || !resultsContainer) return;

        let debounceTimer;

        input.addEventListener("input", function () {
            clearTimeout(debounceTimer);
            const query = this.value.trim();

            if (query.length < 1) {
                resultsContainer.innerHTML = "";
                if (emptyState) emptyState.style.display = "block";
                return;
            }

            debounceTimer = setTimeout(() => {
                fetch(`/api/search/?q=${encodeURIComponent(query)}`)
                    .then((res) => res.json())
                    .then((data) => {
                        resultsContainer.innerHTML = "";
                        if (emptyState) emptyState.style.display = "none";

                        if (data.users.length === 0) {
                            resultsContainer.innerHTML = '<div class="empty-state"><p>No users found matching your search.</p></div>';
                            return;
                        }

                        data.users.forEach((u) => {
                            const item = document.createElement("div");
                            item.className = "search-result-item";
                            item.innerHTML = `
                                <img src="${u.profile_picture}" alt="${u.username}" class="search-result-avatar">
                                <div class="search-result-info">
                                    <strong>${escapeHtml(u.username)}</strong>
                                    <span>${escapeHtml(u.full_name)}</span>
                                </div>
                                <div class="search-result-actions">
                                    <button class="btn ${u.is_following ? "btn-secondary" : "btn-primary"} btn-sm follow-btn"
                                        data-username="${u.username}"
                                        data-following="${u.is_following}">
                                        ${u.is_following ? "Following" : "Follow"}
                                    </button>
                                    <a href="/profile/${u.username}/" class="btn btn-text btn-sm">View</a>
                                </div>
                            `;
                            resultsContainer.appendChild(item);
                        });
                    })
                    .catch(() => {});
            }, 250);
        });
    }

    // ============================================
    // Auto-dismiss flash messages
    // ============================================
    function initFlashMessages() {
        const messages = document.querySelectorAll(".flash-message");
        messages.forEach((msg) => {
            setTimeout(() => {
                msg.style.transition = "opacity 0.5s, transform 0.5s";
                msg.style.opacity = "0";
                msg.style.transform = "translateY(-10px)";
                setTimeout(() => msg.remove(), 500);
            }, 4000);
        });
    }

    // ============================================
    // Utility: escape HTML to prevent XSS
    // ============================================
    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    // ============================================
    // Initialize everything on DOM ready
    // ============================================
    function init() {
        initLikeButtons();
        initCommentForms();
        initDeleteCommentButtons();
        initFollowButtons();
        initNavbarSearch();
        initSearchPage();
        initFlashMessages();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

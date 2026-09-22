# Mini Social Media App

A simplified social media web application built with Django, where users can register, create posts, like and comment, follow other users, and browse profiles. Designed as a college mini project to demonstrate full-stack web development skills.

## Description

MiniSocial is a lightweight social networking platform inspired by Instagram. Users can create an account, customize their profile, share posts with images, interact through likes and comments, follow other users, and search for people. The app features a clean, responsive UI with dynamic interactions powered by vanilla JavaScript and the Fetch API.

## Features

- **User Authentication** — Register, login, logout with Django's built-in auth system
- **User Profiles** — View and edit profile (picture, bio, full name)
- **Posts** — Create, edit, delete, and view posts with optional images
- **Feed** — See posts from yourself and users you follow, newest first
- **Like System** — Like and unlike posts, with dynamic count updates (no page reload)
- **Comment System** — Add and delete comments, with dynamic updates
- **Follow System** — Follow/unfollow users, view followers and following lists
- **Search** — Search users by username or full name with live results
- **Responsive Design** — Works on desktop and mobile devices
- **Django Admin** — Full admin panel for managing all data

## Technologies

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API)
- **Backend:** Python, Django, Django ORM, Django Authentication System
- **Database:** SQLite
- **Image Processing:** Pillow

## Installation

### 1. Clone or download the project

```bash
# If using git
git clone <repository-url>
cd social_media

# Or simply download and extract the project folder
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create a superuser (for admin access)

```bash
python manage.py createsuperuser
```

### 7. Run the development server

```bash
python manage.py runserver
```

The app will be available at `http://127.0.0.1:8000/`

The admin panel is at `http://127.0.0.1:8000/admin/`

## Project Structure

```
social_media/
│
├── manage.py                    # Django management script
│
├── social_media/                # Project configuration
│   ├── settings.py              # Django settings
│   ├── urls.py                  # Root URL configuration
│   ├── wsgi.py                  # WSGI entry point
│   └── asgi.py                  # ASGI entry point
│
├── users/                       # Users app
│   ├── models.py                # Profile and Follow models
│   ├── views.py                 # Auth, profile, follow, search views
│   ├── urls.py                  # User-related URL routes
│   ├── forms.py                 # Registration and profile edit forms
│   └── admin.py                 # Admin config for Profile and Follow
│
├── posts/                       # Posts app
│   ├── models.py                # Post, Comment, Like models
│   ├── views.py                 # Post CRUD, like, comment views + AJAX endpoints
│   ├── urls.py                  # Post-related URL routes
│   ├── forms.py                 # Post and comment forms
│   └── admin.py                 # Admin config for Post, Comment, Like
│
├── templates/                   # HTML templates
│   ├── base.html                # Base template with navbar
│   ├── registration/            # Login and register pages
│   ├── users/                   # Profile, edit profile, search, follow lists
│   └── posts/                   # Feed, post detail, create/edit/delete post
│
├── static/                      # Static files
│   ├── css/
│   │   └── style.css            # All custom CSS styles
│   └── js/
│       └── main.js              # JavaScript for likes, comments, follows, search
│
├── media/                       # User-uploaded files
│   ├── profile_pics/            # Profile pictures
│   └── post_images/             # Post images
│
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## Database Models

### Profile
- `user` — OneToOne link to Django User
- `profile_picture` — Image field (defaults to a placeholder)
- `bio` — Short bio text (max 500 characters)
- `full_name` — User's full name
- `created_at` — Timestamp

### Post
- `author` — ForeignKey to User (cascade delete)
- `content` — Text caption (max 2000 characters)
- `image` — Optional image upload
- `created_at` — Creation timestamp
- `updated_at` — Last update timestamp

### Comment
- `post` — ForeignKey to Post (cascade delete)
- `user` — ForeignKey to User (cascade delete)
- `text` — Comment text (max 500 characters)
- `created_at` — Timestamp

### Like
- `post` — ForeignKey to Post (cascade delete)
- `user` — ForeignKey to User (cascade delete)
- `created_at` — Timestamp
- **Unique constraint** on (post, user) — prevents duplicate likes

### Follow
- `follower` — ForeignKey to User (the one following)
- `following` — ForeignKey to User (the one being followed)
- `created_at` — Timestamp
- **Unique constraint** on (follower, following) — prevents duplicate follows

## How to Use

### Register
1. Go to the login page and click "Sign up"
2. Enter a username, email, password, and confirm password
3. Click "Sign Up" — you'll be redirected to login

### Login
1. Enter your username and password
2. Click "Log In" — you'll see your home feed

### Create Profile
1. After logging in, go to your profile page
2. Click "Edit Profile"
3. Add your full name, bio, and upload a profile picture
4. Click "Save Changes"

### Create Post
1. Click "Create Post" in the navbar or feed header
2. Write a caption and optionally upload an image
3. Click "Publish Post"

### Like a Post
- Click the heart/Like button on any post in the feed or post detail page
- The button toggles between Like and Unlike, and the count updates instantly

### Comment on a Post
- Type your comment in the comment box below any post
- Press "Post" — the comment appears instantly without page reload
- You can delete your own comments on the post detail page

### Follow Users
1. Search for users using the search bar in the navbar or the search page
2. Click "Follow" on a user's profile or in search results
3. View your followers and following on your profile page

### View Profiles
- Click any username or profile picture to view that user's profile
- See their posts, follower/following counts, and bio
- Follow or unfollow from their profile page

## URLs

| URL | Description |
|-----|-------------|
| `/login/` | Login page |
| `/register/` | Registration page |
| `/` | Home feed (requires login) |
| `/search/` | Search users (requires login) |
| `/profile/<username>/` | View a user's profile |
| `/profile/edit/` | Edit your own profile |
| `/profile/<username>/followers/` | View followers list |
| `/profile/<username>/following/` | View following list |
| `/post/create/` | Create a new post |
| `/post/<id>/` | View a single post with comments |
| `/post/<id>/edit/` | Edit your own post |
| `/post/<id>/delete/` | Delete your own post |
| `/admin/` | Django admin panel |

## Testing

After setting up the project, test these scenarios:

1. **Register** a new user with a unique username and email
2. **Login** with your credentials
3. **Edit your profile** — add a full name, bio, and profile picture
4. **Create a post** with text and an image
5. **Edit the post** — change the caption or image
6. **Delete the post** — confirm deletion
7. **Like a post** — verify the heart fills and count increases
8. **Unlike a post** — verify the heart empties and count decreases
9. **Add a comment** — verify it appears instantly
10. **Delete your comment** — verify it disappears
11. **Follow another user** — verify the button changes to "Following"
12. **Unfollow a user** — verify the button changes back to "Follow"
13. **View followers** — see the list of users following you
14. **View following** — see the list of users you follow
15. **Search for users** by username or full name
16. **Logout** — verify you're redirected to login
17. **Login again** — verify your data is still there (SQLite persistence)
18. **Check unauthorized access** — try editing/deleting another user's post or comment (should be denied)
19. **Check duplicate prevention** — try liking a post twice or following someone twice (database prevents this)

## Security Features

- CSRF protection on all forms and AJAX requests
- Password hashing via Django's authentication system
- Session-based authentication with login required on all app pages
- Authorization checks — users can only edit/delete their own posts and comments
- Input validation on all forms (server-side)
- Django ORM used throughout (no raw SQL — prevents SQL injection)
- HTML escaping in JavaScript to prevent XSS
- Unique database constraints on likes and follows to prevent duplicates

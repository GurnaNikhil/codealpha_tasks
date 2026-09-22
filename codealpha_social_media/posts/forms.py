from django import forms


class PostForm(forms.Form):
    content = forms.CharField(
        max_length=2000,
        widget=forms.Textarea(attrs={"class": "form-input", "rows": 4, "placeholder": "What's on your mind?"}),
    )
    image = forms.ImageField(required=False, widget=forms.FileInput(attrs={"class": "form-file-input"}))


class CommentForm(forms.Form):
    text = forms.CharField(
        max_length=500,
        widget=forms.TextInput(attrs={"class": "form-input comment-input", "placeholder": "Write a comment..."}),
    )

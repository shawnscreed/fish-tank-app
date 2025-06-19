# Git Commands for Uploading Code

## 1. Check status

git status



## 2. Stage all changes

git add .


## 3. Commit with a message

git commit -m "Your update message here"


## 4. Push to GitHub

git push origin main



alias gitupdate='git add . && git commit -m "update" && git push origin main'


function gitupdate {
  git add .
  git commit -m "update"
  git push origin main
}


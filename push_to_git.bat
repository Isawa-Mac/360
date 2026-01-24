@echo off
cd c:\Users\isawa\Documents\GitHub\360
git init > git_out.txt 2>&1
git remote add origin https://github.com/Isawa-Mac/360.git >> git_out.txt 2>&1
git add . >> git_out.txt 2>&1
git commit -m "initial commit" >> git_out.txt 2>&1
git branch -M main >> git_out.txt 2>&1
git push -u origin main >> git_out.txt 2>&1

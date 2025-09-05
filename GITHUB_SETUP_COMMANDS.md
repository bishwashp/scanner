# GitHub Setup Commands

## After creating your GitHub repository, run these commands:

```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/scanner.git

# Push to GitHub
git push -u origin main
```

## Replace `YOUR_USERNAME` with your actual GitHub username!

## Example:
If your GitHub username is `bishwash`, the command would be:
```bash
git remote add origin https://github.com/bishwash/scanner.git
git push -u origin main
```

## After pushing to GitHub:

1. **Go to Vercel.com**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import your `scanner` repository**
5. **Deploy!**

Vercel will automatically:
- Build your project
- Deploy it
- Give you a live URL
- Set up automatic deployments on future pushes

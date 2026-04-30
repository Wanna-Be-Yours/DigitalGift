import re

with open('src/app.css', 'r') as f:
    content = f.read()

# Fix the broken section
broken_part = """  /* No height when hidden */
  opacity: 0;



  border-radius: 12px;"""

fixed_part = """  /* No height when hidden */
  opacity: 0;
  overflow: hidden;
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.6s ease,
    margin-left 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  margin-left: 0;
}

.right-column.revealed {
  width: 420px;
  height: auto;
  opacity: 1;
  margin-left: 120px;
}

/* ── Love Letter ── */
.love-letter {
  background: linear-gradient(165deg,
      rgba(255, 248, 252, 0.90) 0%,
      rgba(255, 240, 248, 0.88) 100%);
  border-radius: 12px;"""

content = content.replace(broken_part, fixed_part)

with open('src/app.css', 'w') as f:
    f.write(content)

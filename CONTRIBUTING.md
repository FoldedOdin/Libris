# 🤝 Contributing to Online Library Management System (OLMS)

Thank you for your interest in contributing to OLMS! We welcome contributions from developers of all skill levels. This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
- **Be respectful**: Treat all community members with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that everyone has different skill levels
- **Be professional**: Maintain a professional tone in all interactions

### Unacceptable Behavior
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Spam or irrelevant content
- Sharing private information without permission
- Any behavior that would be inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites
- **Python 3.13+**
- **Node.js 16+**
- **Git**
- **Code Editor** (VS Code recommended)

### Fork and Clone
1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/Foldedodin/online-library-management-system.git
   cd online-library-management-system
   ```

3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/Foldedodin/online-library-management-system.git
   ```

## 🛠️ Development Setup

### Quick Setup
```bash
# Install dependencies
npm install

# Setup backend
cd "Online Library Management System/library"
pip install -r requirements.txt
python manage.py migrate
cd ../..

# Setup frontend
cd react-frontend-olms
npm install
cd ..

# Start development servers
cd react-frontend-olms
npm run dev
```

### Detailed Setup
See the [README.md](README.md) for comprehensive setup instructions.

## 🎯 How to Contribute

### Types of Contributions

1. **🐛 Bug Fixes**
   - Fix existing issues
   - Improve error handling
   - Performance optimizations

2. **✨ New Features**
   - Add new functionality
   - Enhance existing features
   - UI/UX improvements

3. **📚 Documentation**
   - Improve existing docs
   - Add code comments
   - Create tutorials

4. **🧪 Testing**
   - Write unit tests
   - Add integration tests
   - Improve test coverage

5. **🎨 Design**
   - UI/UX improvements
   - Accessibility enhancements
   - Mobile responsiveness

### Contribution Workflow

1. **Check existing issues** to avoid duplicate work
2. **Create an issue** for new features or bugs (if one doesn't exist)
3. **Discuss** your approach in the issue comments
4. **Create a branch** for your work
5. **Make your changes** following our coding standards
6. **Test thoroughly** to ensure nothing breaks
7. **Submit a pull request** with a clear description

## 📝 Coding Standards

### Python (Backend)

#### Style Guide
- Follow **PEP 8** style guide
- Use **Black** for code formatting
- Use **isort** for import sorting
- Maximum line length: **88 characters**

#### Code Quality
```python
# Good: Clear, descriptive names
def calculate_overdue_fine(days_overdue, daily_rate=5):
    """Calculate fine for overdue books."""
    return days_overdue * daily_rate

# Bad: Unclear names
def calc(d, r=5):
    return d * r
```

#### Django Best Practices
- Use Django ORM instead of raw SQL
- Implement proper error handling
- Use Django's built-in security features
- Follow Django naming conventions

#### Example Model
```python
class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    isbn = models.CharField(max_length=13, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['title']
        
    def __str__(self):
        return f"{self.title} by {self.author}"
```

### JavaScript/React (Frontend)

#### Style Guide
- Use **ESLint** and **Prettier**
- Use **camelCase** for variables and functions
- Use **PascalCase** for components
- Use **UPPER_CASE** for constants

#### React Best Practices
```javascript
// Good: Functional component with hooks
const BookList = ({ books, onBookSelect }) => {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Effect logic here
  }, []);
  
  return (
    <div className="book-list">
      {books.map(book => (
        <BookCard 
          key={book.id} 
          book={book} 
          onClick={() => onBookSelect(book)}
        />
      ))}
    </div>
  );
};

// Good: Custom hook
const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Hook logic here
  
  return { books, loading, fetchBooks };
};
```

#### CSS Standards
- Use **CSS variables** for consistency
- Follow **BEM methodology** for class names
- Use **mobile-first** responsive design
- Implement **accessibility** features

```css
/* Good: BEM naming */
.book-card {
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}

.book-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.book-card--featured {
  border: 2px solid var(--primary-color);
}
```

### Git Commit Messages

Use **Conventional Commits** format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

#### Examples
```bash
feat(auth): add password reset functionality
fix(books): resolve search filter bug
docs(api): update endpoint documentation
style(ui): improve button hover effects
refactor(utils): optimize date formatting function
test(auth): add login component tests
chore(deps): update React to version 18.2
```

## 🧪 Testing Guidelines

### Backend Testing (Django)
```python
# tests/test_models.py
from django.test import TestCase
from catalog.models import Book

class BookModelTest(TestCase):
    def setUp(self):
        self.book = Book.objects.create(
            title="Test Book",
            author="Test Author",
            isbn="1234567890123"
        )
    
    def test_book_str_representation(self):
        self.assertEqual(str(self.book), "Test Book by Test Author")
    
    def test_book_creation(self):
        self.assertTrue(isinstance(self.book, Book))
        self.assertEqual(self.book.title, "Test Book")
```

### Frontend Testing (React)
```javascript
// components/__tests__/BookCard.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import BookCard from '../BookCard';

describe('BookCard', () => {
  const mockBook = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author'
  };
  
  test('renders book information', () => {
    render(<BookCard book={mockBook} />);
    
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });
  
  test('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<BookCard book={mockBook} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledWith(mockBook);
  });
});
```

### Running Tests
```bash
# Backend tests
cd "Online Library Management System/library"
python manage.py test

# Frontend tests
cd react-frontend-olms
npm test
```

## 🔄 Pull Request Process

### Before Submitting
1. **Update your branch** with the latest changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** to ensure nothing is broken:
   ```bash
   # Backend
   python manage.py test
   
   # Frontend
   npm test
   ```

3. **Check code quality**:
   ```bash
   # Python
   black . --check
   isort . --check-only
   
   # JavaScript
   npm run lint
   ```

### Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Approval** and merge

## 🐛 Issue Reporting

### Bug Reports
Use the bug report template:

```markdown
**Bug Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 96]
- Python version: [e.g., 3.13]
- Node.js version: [e.g., 16.14]

**Screenshots**
Add screenshots if applicable.

**Additional Context**
Any other relevant information.
```

### Security Issues
**DO NOT** create public issues for security vulnerabilities. See [SECURITY.md](SECURITY.md) for reporting process.

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the proposed feature.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Mockups, examples, or references.
```

### Feature Development Process
1. **Discussion** in the issue
2. **Design** and planning
3. **Implementation** in feature branch
4. **Testing** and review
5. **Documentation** updates
6. **Release** planning

## 📚 Documentation

### Types of Documentation
- **Code Comments**: Explain complex logic
- **API Documentation**: Endpoint descriptions
- **User Guides**: How to use features
- **Developer Guides**: How to contribute
- **README Updates**: Keep installation guide current

### Documentation Standards
- Use clear, simple language
- Include code examples
- Add screenshots for UI features
- Keep documentation up-to-date
- Test all instructions

## 🌟 Recognition

### Contributors
We recognize contributors in several ways:
- **GitHub Contributors** page
- **CHANGELOG.md** mentions
- **README.md** acknowledgments
- **Social media** shout-outs

### Becoming a Maintainer
Regular contributors may be invited to become maintainers with:
- **Commit access** to the repository
- **Review privileges** for pull requests
- **Issue triage** responsibilities
- **Release planning** participation

## 💬 Community

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Reviews**: Code discussions
- **Email**: For security issues (see SECURITY.md)

### Getting Help
- **Documentation**: Check README and docs first
- **Search Issues**: Look for existing solutions
- **Ask Questions**: Create a discussion or issue
- **Be Patient**: Maintainers are volunteers

### Community Guidelines
- **Be respectful** and professional
- **Help others** when you can
- **Share knowledge** and experiences
- **Follow** project guidelines
- **Have fun** and learn together!

## 🎉 Thank You!

Thank you for contributing to OLMS! Your contributions help make this project better for everyone. Whether you're fixing bugs, adding features, improving documentation, or helping other users, every contribution is valuable.

---

**Happy Contributing!** 🚀

For questions about contributing, please create an issue or start a discussion on GitHub.
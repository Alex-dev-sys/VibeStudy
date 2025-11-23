# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "⚠️ Произошла ошибка" [level=3] [ref=e5]:
        - generic [ref=e6]: ⚠️
        - generic [ref=e7]: Произошла ошибка
      - paragraph [ref=e8]: Что-то пошло не так. Не волнуйтесь, ваши данные в безопасности.
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: TypeError
        - generic [ref=e12]: Cannot set properties of undefined (setting 'class-name')
        - group [ref=e13]:
          - generic "Stack trace" [ref=e14] [cursor=pointer]
      - generic [ref=e15]:
        - button "Попробовать снова" [ref=e16] [cursor=pointer]
        - button "На главную" [ref=e17] [cursor=pointer]
  - alert [ref=e18]
  - generic [ref=e21] [cursor=pointer]:
    - img [ref=e22]
    - generic [ref=e24]: 1 error
    - button "Hide Errors" [ref=e25]:
      - img [ref=e26]
```
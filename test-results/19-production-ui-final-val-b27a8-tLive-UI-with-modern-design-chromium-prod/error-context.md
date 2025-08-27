# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Sign in to BigfootLive" [level=2] [ref=e6]
      - paragraph [ref=e7]: Enter your credentials to access your account
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: Welcome Back
        - generic [ref=e11]: Sign in to your BigfootLive account
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]:
            - generic [ref=e15]: Email Address
            - textbox "Email Address" [ref=e16]
          - generic [ref=e17]:
            - generic [ref=e18]: Password
            - generic [ref=e19]:
              - textbox "Password" [ref=e20]
              - button [ref=e21]:
                - img
          - link "Forgot your password?" [ref=e24] [cursor=pointer]:
            - /url: /forgot-password
          - button "Sign In" [disabled]
        - generic [ref=e26]:
          - text: Don't have an account?
          - link "Sign up" [ref=e27] [cursor=pointer]:
            - /url: /register
  - region "Notifications (F8)":
    - list
```
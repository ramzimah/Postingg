import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Link,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core";
import { Formik } from "formik";
import HttpApi from "../../providers/httpApi";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import { tokenAtom, userAtom } from "../../store";
function LoginForm() {
  const [open, setOpen] = useState(false);

  const [, setToken] = useRecoilState(tokenAtom);
  const [, setUser] = useRecoilState(userAtom);

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Forgot password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the email you used to register so we can help you
            access your account.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Send email
          </Button>
        </DialogActions>
      </Dialog>
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={async ({ email, password }, { setSubmitting }) => {
          setSubmitting(true);
          try {
            const result = await HttpApi.post("/user/signin", {
              email,
              password,
            });
            const { user, token } = result.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            setToken(token);
            setUser(user);
          } catch (e) {
            toast("False credentials", { type: "error" });
          }
          setSubmitting(false);
        }}
      >
        {({ values, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="flex"
              justifyContent="center"
              flexDirection="column"
              pt={3}
            >
              <Box>
                <TextField
                  type="email"
                  name="email"
                  label="Email address"
                  variant="outlined"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  fullWidth
                  required
                />
              </Box>
              <Box mt={1}>
                <TextField
                  type="password"
                  name="password"
                  label="Password"
                  variant="outlined"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                />
              </Box>
              <Box mt={2} display="flex" justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  Login
                </Button>
              </Box>
              <Box textAlign="center" mt={3}>
                <Typography>
                  <Link onClick={() => setOpen(true)}>Forgot password?</Link>
                </Typography>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </>
  );
}

export default LoginForm;

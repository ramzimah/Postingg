import React, { useState } from "react";
import { Box, TextField, Button, Link, Typography } from "@material-ui/core";
import { Formik } from "formik";
import PropTypes from "prop-types";
import HttpApi from "../../providers/httpApi";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import { tokenAtom, userAtom } from "../../store";

function RegisterForm({ setPage }) {
  const [, setToken] = useRecoilState(tokenAtom);
  const [, setUser] = useRecoilState(userAtom);

  return (
    <>
      <Formik
        initialValues={{ email: "", password: "", username: "", bio: "" }}
        onSubmit={async (
          { email, password, username, bio },
          { setSubmitting }
        ) => {
          setSubmitting(true);
          try {
            const result = await HttpApi.post("/user/signup", {
              email,
              password,
              username,
              bio,
            });
            const { token, user } = result.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            setToken(token);
            setUser(user);
          } catch (e) {
            if (e.response.status === 409 && e.response.data) {
              toast(e.response.data.errors, { type: "warning" });
            } else {
              toast("Server error");
            }
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
                  type="text"
                  name="username"
                  label="username"
                  variant="outlined"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                  fullWidth
                  required
                />
              </Box>
              <Box mt={1}>
                <TextField
                  type="text"
                  name="bio"
                  label="bio"
                  variant="outlined"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.bio}
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
                  Register
                </Button>
              </Box>
              <Box textAlign="center" mt={3}>
                <Typography>
                  <Link
                    onClick={() => {
                      setPage("login");
                    }}
                  >
                    Already have an account? Click here to sign in.
                  </Link>
                </Typography>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </>
  );
}

RegisterForm.propTypes = {
  setPage: PropTypes.func,
};

export default RegisterForm;

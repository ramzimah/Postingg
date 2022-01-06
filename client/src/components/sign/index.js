import React, { useState, useEffect } from "react";
import { Container, Grid, Box, Typography } from "@material-ui/core";
import LoginForm from "./loginForm";
import RegisterForm from "./registerForm";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { tokenAtom, userAtom } from "../../store";

function SignPage() {
  const [page, setPage] = useState("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  const [token, setToken] = useRecoilState(tokenAtom);
  const [, setUser] = useRecoilState(userAtom);
  let navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token]);

  return (
    <Container>
      <Grid container>
        <Grid item xs={12}>
          <Grid container justify="center">
            <Grid item>
              <Box pt={3}>
                <Typography variant="h2" color="primary">
                  Postingg
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" pt={5}>
            <Typography>
              Welcome to Postingg. Please sign in or register to your account in
              order to start blogging.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" pt={5}>
            <Box
              mr={1}
              borderBottom={page === "login" ? 2 : undefined}
              onClick={() => {
                setPage("login");
              }}
            >
              <Typography>Sign in</Typography>
            </Box>
            <Box
              ml={1}
              borderBottom={page === "register" ? 2 : undefined}
              onClick={() => {
                setPage("register");
              }}
            >
              <Typography>Register</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Grid container justify="center">
            <Grid item xs={4}>
              {page === "login" ? (
                <LoginForm />
              ) : (
                <RegisterForm setPage={setPage} />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default SignPage;

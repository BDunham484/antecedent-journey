import { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../utils/mutations";
import Auth from '../utils/auth';
import FormCard from "../components/shared/FormCard";

const Login = () => {
    const [formState, setFormState] = useState({ email: '', password: '' });

    const [login, { error }] = useMutation(LOGIN_USER);

    //update state based on form input changes
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormState({
            ...formState,
            [name]: value,
        });
    };

    //submit form
    const handleFormSubmit = async event => {
        event.preventDefault();

        try {
            const { data } = await login({
                variables: { ...formState }
            });

            Auth.login(data.login.token);
        } catch (e) {
            console.error(e);
        }
    };


    return (
        <div className='container'>
            <FormCard>
                <form onSubmit={handleFormSubmit}>
                    <p>LOGIN</p>
                    <div className="form-div">
                        <label htmlFor="email">Email</label>
                        <input
                            placeholder='Your email'
                            name='email'
                            type='email'
                            id='email'
                            value={formState.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-div">
                        <label htmlFor="password">Password</label>
                        <input
                            placeholder='********'
                            name='password'
                            type='password'
                            id='password'
                            value={formState.password}
                            onChange={handleChange}
                        />
                    </div>
                    <button type='submit' className="login-signup-button">Submit</button>
                    {error && <div>Login Failed</div>}
                </form>
            </FormCard>
        </div>
    )
}

export default Login;
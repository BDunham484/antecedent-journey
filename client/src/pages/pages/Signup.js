import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_USER } from "../utils/mutations";
import Auth from '../utils/auth';
import FormCard from "../components/shared/FormCard";

const Signup = () => {
    const [formState, setFormState] = useState({ username: '', email: '', password: '' });

    const [addUser, { error }] = useMutation(ADD_USER);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormState({
            ...formState,
            [name]: value,
        });
    };

    const handleFormSubmit = async event => {
        event.preventDefault();

        try {
            //execute addUser mutation and pass in variable data from form
            const { data } = await addUser({
                variables: { ...formState }
            });

            Auth.login(data.addUser.token);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className='container'>
            <FormCard>
                <form onSubmit={handleFormSubmit}>
                    <p>SIGN UP</p>
                    <div className="form-div">
                        <label htmlFor="username">Username</label>
                        <input
                            placeholder='Your username'
                            name='username'
                            type='username'
                            id='username'
                            value={formState.username}
                            onChange={handleChange}
                        />
                    </div>
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
                </form>
                {error && <div>Sign up failed</div>}
            </FormCard>

        </div>
    )
}

export default Signup;
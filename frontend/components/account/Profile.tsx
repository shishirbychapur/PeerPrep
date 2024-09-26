import { useState } from 'react'
import { InputField, OptionsField } from '../ui/custom-input'

interface IProfileFormInput {
    username: string
    proficiency: string
}

function Profile() {
    const initialValues: IProfileFormInput = {
        username: '',
        proficiency: '',
    }

    const [formValues, setFormValues] = useState(initialValues)
    const [formErrors, setFormErrors] = useState(initialValues)
    // const [isSubmit, setIsSubmit] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>): void => {
        const { id, value } = e.target
        setFormValues({ ...formValues, [id]: value })
    }

    const validateInput = (values: IProfileFormInput): IProfileFormInput => {
        const errors = { ...initialValues }
        if (!values.username) {
            errors.username = 'Please Enter a username!'
        }

        if (!values.proficiency) {
            errors.proficiency = 'Please choose a proficiency level!'
        }

        return errors
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault() // Prevents default form submission behavior
        setFormErrors(validateInput(formValues))
        // setIsSubmit(true)
        // Handle submit here, make sure receive 200, if not then return error
    }

    return (
        <>
            <div className="flex flex-row">
                <form className="flex flex-[4] flex-col h-full w-full space-y-6 pt-4" onSubmit={handleSubmit}>
                    <InputField
                        type="text"
                        id="username"
                        label="Username"
                        placeholder="eg. John Doe"
                        value={formValues.username}
                        onChange={handleChange}
                        error={formErrors.username}
                    />

                    <OptionsField
                        id="proficiency"
                        label="Proficiency"
                        error={formErrors.proficiency}
                        onChange={handleChange}
                    />

                    <button
                        type="submit"
                        className="w-fit bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600"
                    >
                        Update Profile
                    </button>
                </form>
                <div className="flex flex-[2]"></div>
            </div>
        </>
    )
}

export default Profile

import AuthCard from "../../components/auth/AuthCard.jsx"
import AuthHeader from "../../components/auth/AuthHeader.jsx"
import AuthLayout from "../../components/auth/AuthLayout.jsx"
import InputField from "../../components/auth/InputField.jsx"
import { FaIdCard } from "react-icons/fa"
import { FiUpload } from "react-icons/fi";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx"

const VerifyAccount = () => {
  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title = "Verify Account"
          subtitle = "Enter additional details to get verified as a student of Sinhgad Institutes."
        />

        <InputField icon={FaIdCard} type="text" placeholder="PRN number"/>

        <div className="mt-4">
          <label className="block text-sm font-medium text-text mb-3 text-center">
            Upload College ID Card
          </label>

          <div className="relative bg-card border-2 border-dashed border-primary rounded-xl px-4 py-6 text-center cursor-pointer hover:bg-background transition">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center justify-center">
              <FiUpload className="text-text text-2xl mb-2" />

              <p className="text-sm text-text">
                Click to upload or drag & drop
              </p>

              <p className="text-xs text-muted mt-1">
                PNG, JPG, JPEG (max 5MB)
              </p>
            </div>
          </div>
        </div>



        <PrimaryButton type = "submit">Verify Account</PrimaryButton>

      </AuthCard>
    </AuthLayout>
  )
}

export default VerifyAccount

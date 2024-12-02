import React, { useState } from "react"
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import { cilLockLocked, cilUser } from "@coreui/icons"
import axios from "axios"

const VendorRegister = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [handle, setHandle] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // Step 1: Email/Password | Step 2: Vendor Profile
  const [authToken, setAuthToken] = useState(null)


  // Step 1: Register with email and password
  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
  
    try {
      const response = await axios.post(
        `http://localhost:9000/auth/vendor/emailpass/register`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
     
      if (response.data.token) {
        const token = response.data.token
        setAuthToken(token)
        localStorage.setItem('token', token)
        setStep(2)
      } else {
        setMessage("No token received")
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed")
      console.error("Registration error:", error)
    } finally {
      setLoading(false)
    }
  }
  // Step 2: Create vendor profile
  const handleVendorProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const vendorData = {
        name: companyName,
        handle: handle,
        admin: {
          email,
          first_name: firstName,
          last_name: lastName,
        },
      }

      const response = await axios.post(
        `http://localhost:9000/vendors`,
        vendorData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!authToken) {
        setMessage("Authentication token is missing")
        return
      }
      if (response.status === 200 || response.status === 201) {
        setMessage("Vendor registration successful!")
        navigate('/vendor/dashboard')
      } else {
        setMessage("Failed to create vendor profile.")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "An error occurred"
      setMessage(errorMessage)
      console.error("Vendor profile submission error:", error.response?.data)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={step === 1 ? handleEmailPasswordSubmit : handleVendorProfileSubmit}>
                  <h1>{step === 1 ? "Vendor Registration - Step 1" : "Vendor Registration - Step 2"}</h1>
                  <p className="text-body-secondary">{step === 1 ? "Enter your email and password" : "Complete your vendor profile"}</p>

                  {/* Step 1: Email and Password */}
                  {step === 1 && (
                    <>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </CInputGroup>

                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </CInputGroup>

                      <div className="d-grid">
                        <CButton color="success" type="submit" disabled={loading}>
                          {loading ? "Registering..." : "Continue to Next Step"}
                        </CButton>
                      </div>
                    </>
                  )}

                  {/* Step 2: Vendor Profile */}
                  {step === 2 && (
                    <>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Company Name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </CInputGroup>

                      <CInputGroup className="mb-3">
                        <CInputGroupText>@</CInputGroupText>
                        <CFormInput
                          placeholder="Handle"
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          required
                        />
                      </CInputGroup>

                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </CInputGroup>

                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Last Name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </CInputGroup>

                      <div className="d-grid">
                        <CButton color="success" type="submit" disabled={loading}>
                          {loading ? "Creating Vendor..." : "Submit"}
                        </CButton>
                      </div>
                    </>
                  )}

                  {/* Message */}
                  {message && (
                    <div className="mt-3">
                      <p className={`text-center ${message.includes("successful") ? "text-success" : "text-danger"}`}>
                        {message}
                      </p>
                    </div>
                  )}
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default VendorRegister

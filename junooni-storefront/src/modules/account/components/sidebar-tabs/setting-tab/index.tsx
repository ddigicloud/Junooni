"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreditCard } from "@medusajs/icons"
import Modal from "@modules/common/components/modal"
import { Button } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import AddressBook from "@modules/account/components/address-book"
import { HttpTypes } from "@medusajs/types"

const SettingsTab = ({ user, customer, region }) => {
  const router = useRouter()

  // Modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false)
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false)
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false)

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formError, setFormError] = useState("")

  // Selected items for editing/deleting
  const [editingPayment, setEditingPayment] = useState(null)
  const [deletingPaymentId, setDeletingPaymentId] = useState(null)

  // Form data
  const [profileFormData, setProfileFormData] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    company: customer?.company || "",
  })

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Customer payment methods state
  const [paymentMethods, setPaymentMethods] = useState(
    user.paymentMethods || []
  )

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    orderUpdates: true,
    creatorUpdates: true,
    membershipRewards: true,
    marketingCommunications: false,
  })

  // Function to navigate to address page
  const goToAddressPage = () => {
    router.push("/account/addresses")
  }

  // Profile form handlers
  const handleProfileInputChange = (e) => {
    setProfileFormData({
      ...profileFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Update customer data here with API call
      setIsSubmitting(false)
      setShowEditProfileModal(false)
    }, 800)
  }

  // Password form handlers
  const handlePasswordInputChange = (e) => {
    setPasswordFormData({
      ...passwordFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Password validation
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setFormError("New passwords don't match")
      setIsSubmitting(false)
      return
    }

    if (passwordFormData.newPassword.length < 8) {
      setFormError("Password must be at least 8 characters")
      setIsSubmitting(false)
      return
    }

    // Simulate API call with timeout
    setTimeout(() => {
      // Update password here with API call
      setIsSubmitting(false)
      setFormError("")
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowEditPasswordModal(false)
    }, 800)
  }

  // Payment method handlers
  const handleEditPayment = (payment) => {
    setEditingPayment(payment)
    setShowEditPaymentModal(true)
  }

  const handleDeletePaymentClick = (paymentId) => {
    setDeletingPaymentId(paymentId)
    setShowDeletePaymentModal(true)
  }

  const handleDeletePayment = () => {
    setIsDeleting(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Remove payment method with API call
      setPaymentMethods((prevMethods) =>
        prevMethods.filter((method) => method.id !== deletingPaymentId)
      )
      setIsDeleting(false)
      setShowDeletePaymentModal(false)
    }, 800)
  }

  const handleSetDefaultPayment = (paymentId) => {
    // Simulate API call with timeout
    setTimeout(() => {
      // Set default payment method with API call
      setPaymentMethods((prevMethods) =>
        prevMethods.map((method) => ({
          ...method,
          default: method.id === paymentId,
        }))
      )
    }, 200)
  }

  // Notification preferences handler
  const handleToggleNotification = (preference) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [preference]: !prev[preference],
    }))
  }

  const handleSavePreferences = () => {
    setIsSubmitting(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Save preferences with API call
      setIsSubmitting(false)
      // Show success message or feedback
    }, 800)
  }

  // Reset form errors when modals are closed
  useEffect(() => {
    if (!showEditProfileModal && !showEditPasswordModal) {
      setFormError("")
    }
  }, [showEditProfileModal, showEditPasswordModal])

  return (
    <div>
      <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Account Settings
        </h1>

        {/* Profile Settings */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Profile Information
            </h2>
            <div className="h-1 w-16 bg-[#e65100]/80 rounded ml-4"></div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            <div className="md:w-3/4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                    value={profileFormData.first_name}
                    onChange={handleProfileInputChange}
                    name="first_name"
                    disabled
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                    value={profileFormData.last_name}
                    onChange={handleProfileInputChange}
                    name="last_name"
                    disabled
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                    value={profileFormData.email}
                    onChange={handleProfileInputChange}
                    name="email"
                    disabled
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                    value={profileFormData.phone}
                    onChange={handleProfileInputChange}
                    name="phone"
                    disabled
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  className="px-6 py-2.5 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition-colors duration-200 shadow-sm hover:shadow flex items-center justify-center"
                  onClick={() => setShowEditProfileModal(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Password Settings */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Password</h2>
            <div className="h-1 w-16 bg-[#e65100]/80 rounded ml-4"></div>
          </div>

          <div className="max-w-lg">
            <p className="mb-4 text-gray-600">
              Your password must be at least 8 characters long and include a mix
              of letters, numbers, and symbols for better security.
            </p>
            <button
              className="px-6 py-2.5 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition-colors duration-200 shadow-sm hover:shadow flex items-center justify-center"
              onClick={() => setShowEditPasswordModal(true)}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Addresses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Saved Addresses
              </h2>
              <div className="h-1 w-12 bg-[#e65100]/80 rounded ml-4 hidden sm:block"></div>
            </div>
            <button
              className="flex items-center px-4 py-2 text-sm transition-all border border-[#e65100] text-[#e65100] rounded-lg hover:bg-[#e65100]/5 hover:shadow-sm"
              onClick={goToAddressPage}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              View All Addresses
            </button>
          </div>

          <div className="p-4 bg-white rounded-lg">
            {/* Using the AddressBook component as shown in the provided code */}
            <AddressBook customer={customer} region={region} />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Payment Methods
              </h2>
              <div className="h-1 w-12 bg-[#e65100]/80 rounded ml-4 hidden sm:block"></div>
            </div>
            <button
              className="flex items-center px-4 py-2 text-sm transition-all border border-[#e65100] text-[#e65100] rounded-lg hover:bg-[#e65100]/5 hover:shadow-sm"
              onClick={() => setShowAddPaymentModal(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Payment Method
            </button>
          </div>

          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center border border-gray-200 rounded-lg bg-gray-50">
                <CreditCard className="w-10 h-10 mb-2 text-gray-400" />
                <div className="mb-2 text-gray-500">
                  No payment methods saved yet
                </div>
                <button
                  className="mt-2 text-sm text-[#e65100] hover:text-[#d84315] transition-colors"
                  onClick={() => setShowAddPaymentModal(true)}
                >
                  Add your first payment method
                </button>
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg relative transition-all hover:shadow-md ${
                    method.default
                      ? "border-[#e65100]"
                      : "border-gray-200 hover:border-[#e65100]/30"
                  }`}
                >
                  {method.default && (
                    <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-[#e65100] text-white rounded-full">
                      Default
                    </span>
                  )}

                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-6 mr-3 bg-white border border-gray-200 rounded">
                      {method.type === "visa" ? (
                        <span className="text-xs font-bold text-blue-600">
                          VISA
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-600">
                          MC
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {method.type === "visa" ? "Visa" : "Mastercard"} ending
                        in {method.lastFour}
                      </div>
                      <div className="text-sm text-gray-600">
                        Expires {method.expiryDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      className="flex items-center text-sm text-gray-600 hover:text-[#e65100] transition-colors"
                      onClick={() => handleEditPayment(method)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      className="flex items-center text-sm text-gray-600 transition-colors hover:text-rose-500"
                      onClick={() => handleDeletePaymentClick(method.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                    {!method.default && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          className="text-sm text-[#e65100] hover:text-[#d84315] transition-colors"
                          onClick={() => handleSetDefaultPayment(method.id)}
                        >
                          Set as Default
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Notification Preferences
            </h2>
            <div className="h-1 w-16 bg-[#e65100]/80 rounded ml-4 hidden sm:block"></div>
          </div>

          <div className="space-y-4">
            <div className="p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Order Updates</h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications about your order status and tracking
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationPreferences.orderUpdates}
                    onChange={() => handleToggleNotification("orderUpdates")}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                </label>
              </div>
            </div>

            <div className="p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Creator Updates</h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications when creators you follow release new
                    merchandise
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationPreferences.creatorUpdates}
                    onChange={() => handleToggleNotification("creatorUpdates")}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                </label>
              </div>
            </div>

            <div className="p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Membership Rewards</h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications about points earned and special offers
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationPreferences.membershipRewards}
                    onChange={() =>
                      handleToggleNotification("membershipRewards")
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                </label>
              </div>
            </div>

            <div className="p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Marketing Communications</h3>
                  <p className="text-sm text-gray-600">
                    Receive newsletters and promotional offers from Junooni
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notificationPreferences.marketingCommunications}
                    onChange={() =>
                      handleToggleNotification("marketingCommunications")
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#e65100]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e65100]"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              className="px-6 py-2.5 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition-colors duration-200 shadow-sm hover:shadow flex items-center justify-center"
              onClick={handleSavePreferences}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditProfileModal}
        close={() => setShowEditProfileModal(false)}
        data-testid="edit-profile-modal"
      >
        <Modal.Title>
          <h2 className="text-xl font-semibold text-[#e65100]">Edit Profile</h2>
        </Modal.Title>
        <form onSubmit={handleProfileSubmit}>
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    name="first_name"
                    required
                    value={profileFormData.first_name}
                    onChange={handleProfileInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    name="last_name"
                    required
                    value={profileFormData.last_name}
                    onChange={handleProfileInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    name="company"
                    value={profileFormData.company || ""}
                    onChange={handleProfileInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={profileFormData.phone}
                    onChange={handleProfileInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={profileFormData.email}
                  onChange={handleProfileInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                />
              </div>
            </div>
            {formError && (
              <div className="mt-2 text-sm text-rose-500">{formError}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex flex-col w-full gap-3 mt-6 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEditProfileModal(false)}
                className="order-2 w-full border border-gray-300 h-11 sm:w-auto sm:order-1"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-6 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center"
              >
                {isSubmitting ? <Spinner /> : "Save Changes"}
              </button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Edit Password Modal */}
      <Modal
        isOpen={showEditPasswordModal}
        close={() => setShowEditPasswordModal(false)}
        data-testid="edit-password-modal"
      >
        <Modal.Title>
          <h2 className="text-xl font-semibold text-[#e65100]">
            Change Password
          </h2>
        </Modal.Title>
        <form onSubmit={handlePasswordSubmit}>
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  name="currentPassword"
                  type="password"
                  required
                  value={passwordFormData.currentPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  name="newPassword"
                  type="password"
                  required
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={passwordFormData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            {formError && (
              <div className="mt-2 text-sm text-rose-500">{formError}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex flex-col w-full gap-3 mt-6 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEditPasswordModal(false)}
                className="order-2 w-full border border-gray-300 h-11 sm:w-auto sm:order-1"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-6 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center"
              >
                {isSubmitting ? <Spinner /> : "Update Password"}
              </button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal
        isOpen={showAddPaymentModal}
        close={() => setShowAddPaymentModal(false)}
        data-testid="add-payment-modal"
      >
        <Modal.Title>
          <h2 className="text-xl font-semibold text-[#e65100]">
            Add Payment Method
          </h2>
        </Modal.Title>
        <form>
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Security Code (CVV)
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                />
              </div>
              <div className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#e65100] rounded border-gray-300 focus:ring-[#e65100]"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Set as default payment method
                  </span>
                </label>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex flex-col w-full gap-3 mt-6 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddPaymentModal(false)}
                className="order-2 w-full border border-gray-300 h-11 sm:w-auto sm:order-1"
              >
                Cancel
              </Button>
              <button
                type="button"
                className="h-11 px-6 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center"
              >
                Add Payment Method
              </button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Edit Payment Method Modal */}
      <Modal
        isOpen={showEditPaymentModal}
        close={() => setShowEditPaymentModal(false)}
        data-testid="edit-payment-modal"
      >
        <Modal.Title>
          <h2 className="text-xl font-semibold text-[#e65100]">
            Edit Payment Method
          </h2>
        </Modal.Title>
        <form>
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-3">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">
                  Card Number:{" "}
                  <span className="font-medium">
                    •••• •••• •••• {editingPayment?.lastFour}
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    defaultValue={editingPayment?.expiryDate || ""}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Security Code (CVV)
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  defaultValue={editingPayment?.cardholderName || ""}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e65100] focus:border-transparent transition-all"
                />
              </div>
              <div className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#e65100] rounded border-gray-300 focus:ring-[#e65100]"
                    defaultChecked={editingPayment?.default}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Set as default payment method
                  </span>
                </label>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex flex-col w-full gap-3 mt-6 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEditPaymentModal(false)}
                className="order-2 w-full border border-gray-300 h-11 sm:w-auto sm:order-1"
              >
                Cancel
              </Button>
              <button
                type="button"
                className="h-11 px-6 bg-[#e65100] text-white rounded-lg hover:bg-[#d84315] transition w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center"
              >
                Save Changes
              </button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Payment Method Modal */}
      <Modal
        isOpen={showDeletePaymentModal}
        close={() => setShowDeletePaymentModal(false)}
        data-testid="delete-payment-modal"
      >
        <Modal.Title>
          <h2 className="text-xl font-semibold text-gray-900">
            Confirm Deletion
          </h2>
        </Modal.Title>
        <Modal.Body>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete this payment method?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex flex-col w-full gap-3 mt-4 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeletePaymentModal(false)}
              className="order-2 w-full border border-gray-300 h-11 sm:w-auto sm:order-1"
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleDeletePayment}
              disabled={isDeleting}
              className="flex items-center justify-center order-1 w-full px-6 text-white transition rounded-lg h-11 bg-rose-500 hover:bg-rose-600 sm:w-auto sm:order-2"
            >
              {isDeleting ? <Spinner /> : "Delete Payment Method"}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default SettingsTab

/* eslint-disable prettier/prettier */
import React from "react";
import PropTypes from "prop-types"; // Import prop-types
import { Modal, Button } from "react-bootstrap"; // Using Bootstrap for simplicity

const CreateProductModal = ({ show, handleClose, onOptionSelect }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button
          variant="primary"
          onClick={() => onOptionSelect("design")}
          style={{ marginBottom: "10px", width: "100%" }}
        >
          Design something (e.g., tee, mug, etc.)
        </Button>
        <Button
          variant="secondary"
          onClick={() => onOptionSelect("sell")}
          style={{ width: "100%" }}
        >
          Sell something you have
        </Button>
      </Modal.Body>
    </Modal>
  );
};

// Add prop-types validation
CreateProductModal.propTypes = {
  show: PropTypes.bool.isRequired, // Validate 'show' as a required boolean
  handleClose: PropTypes.func.isRequired, // Validate 'handleClose' as a required function
  onOptionSelect: PropTypes.func.isRequired, // Validate 'onOptionSelect' as a required function
};

export default CreateProductModal;

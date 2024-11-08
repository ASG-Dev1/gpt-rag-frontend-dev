import { useEffect } from 'react'
import Modal from 'react-modal'


type Props = {
  isOpen: boolean
  style?: Modal.Styles
  className?: string
  onRequestClose?: any
  children: any
}

const modalOverlay = {
  overlay: {
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  }
}

const BaseModal = (props: Props) => {
  const { children, isOpen, onRequestClose } = props

  const modalStyle = { ...props.style, ...modalOverlay }

  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = 'hidden'
  //   } else {
  //     document.body.style.overflow = 'visible'
  //   }
  // }, [isOpen])


  useEffect(() => {
    // Only handle modal-specific styles without locking body scroll
    return () => {
      document.body.style.overflow = 'visible'; // Ensure body scroll is reset if the modal is closed
    };
  }, []);


  return isOpen ? (
    <Modal {...props}
      style={modalStyle}>
      {children}
      {/* shouldCloseOnOverlayClick={true}  // Enable closing the modal when clicking outside */}
      shouldFocusAfterRender={false} // Prevent modal from capturing all scroll focus
      onRequestClose={onRequestClose}   // Call the provided close function when clicking outside
    </Modal>
  ) : null

}

export default BaseModal

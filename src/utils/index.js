export const toastification = (payload) => {
    payload.vm.$toast[payload.type || 'info'](payload.text || '', {
        position: 'bottom-right',
        timeout: payload.timeout || 3000,
        closeOnClick: true,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: false,
        hideProgressBar: false,
        closeButton: 'button',
        icon: true,
        rtl: false
    })
}

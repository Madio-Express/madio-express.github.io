/**
 * MercadoPago Payment Brick Bridge
 *
 * Bridges the MercadoPago JS SDK (Payment Brick) with the Flutter app.
 * Exposes window.MercadoPagoBridge with init, renderPaymentBrick, and destroy.
 */
(function () {
  var mp = null;
  var brickController = null;

  window.MercadoPagoBridge = {
    /**
     * Initializes the MercadoPago SDK with the given public key.
     * @param {string} publicKey - MercadoPago public key (APP_USR-xxx)
     */
    init: function (publicKey) {
      if (!window.MercadoPago) {
        console.error('MercadoPagoBridge: MercadoPago SDK not loaded');
        return;
      }
      mp = new MercadoPago(publicKey, { locale: 'es-CO' });
      console.log('MercadoPagoBridge: SDK initialized');
    },

    /**
     * Renders the Payment Brick inside the given container.
     * @param {string} containerId - DOM element ID to render the brick into
     * @param {number} amount - Transaction amount
     * @param {string} backendUrl - Backend URL for process-payment endpoint
     * @param {string} authHeader - Authorization header value (Bearer token)
     * @param {string} storeId - Store identifier
     */
    renderPaymentBrick: function (containerId, amount, backendUrl, authHeader, storeId) {
      if (!mp) {
        console.error('MercadoPagoBridge: SDK not initialized. Call init() first.');
        return;
      }

      // Destroy previous brick if exists
      if (brickController) {
        try { brickController.unmount(); } catch (e) { }
        brickController = null;
      }

      var bricksBuilder = mp.bricks();

      bricksBuilder.create('payment', containerId, {
        initialization: {
          amount: amount
        },
        customization: {
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all'
          },
          visual: {
            style: {
              theme: 'default'
            }
          }
        },
        callbacks: {
          onReady: function () {
            window.mpBrickReady = true;
            console.log('MercadoPagoBridge: Brick ready');
            window.dispatchEvent(new CustomEvent('mpBrickReady'));
          },
          onSubmit: function (param) {
            var formData = param.formData;
            // Add storeId to the request
            formData.storeId = storeId;

            console.log('MercadoPagoBridge: onSubmit, sending to backend...');

            return fetch(backendUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
              },
              body: JSON.stringify(formData)
            })
              .then(function (response) {
                return response.json().then(function (data) {
                  if (!response.ok) {
                    throw new Error(data.error || data.message || 'Payment processing failed');
                  }
                  console.log('MercadoPagoBridge: Payment result', data);
                  window.dispatchEvent(new CustomEvent('mpPaymentSuccess', {
                    detail: JSON.stringify(data)
                  }));
                  return data;
                });
              })
              .catch(function (error) {
                console.error('MercadoPagoBridge: Payment error', error);
                window.dispatchEvent(new CustomEvent('mpPaymentError', {
                  detail: error.message || 'Error processing payment'
                }));
                throw error;
              });
          },
          onError: function (error) {
            console.error('MercadoPagoBridge: Brick error', error);
            window.dispatchEvent(new CustomEvent('mpBrickError', {
              detail: error.message || 'Payment brick error'
            }));
          }
        }
      }).then(function (controller) {
        brickController = controller;
        console.log('MercadoPagoBridge: Brick created successfully');
      }).catch(function (error) {
        console.error('MercadoPagoBridge: Error creating brick', error);
        window.dispatchEvent(new CustomEvent('mpBrickError', {
          detail: error.message || 'Error creating payment brick'
        }));
      });
    },

    /**
     * Destroys the current brick instance.
     */
    destroy: function () {
      if (brickController) {
        try {
          brickController.unmount();
          console.log('MercadoPagoBridge: Brick destroyed');
        } catch (e) {
          console.warn('MercadoPagoBridge: Error destroying brick', e);
        }
        brickController = null;
      }
      window.mpBrickReady = false;
    }
  };
})();

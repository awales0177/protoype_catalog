import { Link } from 'react-router-dom';
import { assetDetail } from '../routes';
import { useSubscriptions } from '../context/SubscriptionsContext';
import { catalogData } from '../services/catalogApi';
import { BellOffIcon } from '../icons';
import PropTypes from 'prop-types';
import { Modal } from './ui';
import './SubscriptionsModal.css';

function SubscriptionsModal({
  onClose,
  subscribedIds: subscribedIdsProp,
  toggleSubscription: toggleSubscriptionProp,
  getAssetById: getAssetByIdProp,
}) {
  const context = useSubscriptions();
  const subscribedIds = subscribedIdsProp !== undefined ? subscribedIdsProp : context.subscribedIds;
  const toggleSubscription = toggleSubscriptionProp !== undefined ? toggleSubscriptionProp : context.toggleSubscription;
  const getAssetById = getAssetByIdProp !== undefined ? getAssetByIdProp : catalogData.getAssetById;

  return (
    <Modal
      onClose={onClose}
      titleId="subscriptions-modal-title"
      title="Subscribed items"
      size="sm"
      flushBodyTop
      bodyClassName="subscriptionsModalBody"
    >
      {subscribedIds.length === 0 ? (
        <p className="subscriptionsModalEmpty">You haven’t subscribed to any items yet. Use the bell on an asset page to subscribe.</p>
      ) : (
        <ul className="subscriptionsModalList" aria-label="Subscribed assets">
          {subscribedIds.map((assetId) => {
            const asset = getAssetById(assetId);
            return (
              <li key={assetId} className="subscriptionsModalItem">
                <Link to={assetDetail(assetId)} className="subscriptionsModalLink" onClick={onClose}>
                  <span className="subscriptionsModalItemName">{asset.name}</span>
                  <span className="subscriptionsModalItemType">{asset.type}</span>
                </Link>
                <button
                  type="button"
                  className="subscriptionsModalUnsubscribe"
                  onClick={() => toggleSubscription(assetId)}
                  aria-label={`Unsubscribe from ${asset.name}`}
                  title="Unsubscribe"
                >
                  <BellOffIcon />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

SubscriptionsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  subscribedIds: PropTypes.arrayOf(PropTypes.string),
  toggleSubscription: PropTypes.func,
  getAssetById: PropTypes.func,
};

export default SubscriptionsModal;

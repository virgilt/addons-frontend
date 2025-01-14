/* @flow */
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import {
  expandCollections,
  fetchUserCollections,
} from 'amo/reducers/collections';
import { getCurrentUser } from 'amo/reducers/users';
import AuthenticateButton from 'core/components/AuthenticateButton';
import { withFixedErrorHandler } from 'core/errorHandler';
import translate from 'core/i18n/translate';
import Button from 'ui/components/Button';
import Card from 'ui/components/Card';
import CardList from 'ui/components/CardList';
import UserCollection from 'ui/components/UserCollection';
import type { CollectionType } from 'amo/reducers/collections';
import type { AppState } from 'amo/store';
import type { ErrorHandlerType } from 'core/errorHandler';
import type { I18nType } from 'core/types/i18n';
import type { DispatchFunc } from 'core/types/redux';

import './styles.scss';

export type Props = {||};

export type InternalProps = {|
  ...Props,
  collections: Array<CollectionType> | null,
  currentUserId: number | null,
  dispatch: DispatchFunc,
  errorHandler: ErrorHandlerType,
  i18n: I18nType,
  isLoggedIn: boolean,
  loadingUserCollections: boolean,
|};

export class CollectionListBase extends React.Component<InternalProps> {
  componentDidMount() {
    const {
      collections,
      currentUserId,
      dispatch,
      errorHandler,
      loadingUserCollections,
    } = this.props;

    if (currentUserId && !loadingUserCollections && !collections) {
      dispatch(
        fetchUserCollections({
          errorHandlerId: errorHandler.id,
          userId: currentUserId,
        }),
      );
    }
  }

  renderCollections() {
    const { i18n, collections } = this.props;
    const noCollectionsText = i18n.gettext('You do not have any collections.');

    const collectionElements = [];

    if (collections) {
      collections.forEach((collection) => {
        const { authorId, id, name, numberOfAddons, slug } = collection;

        collectionElements.push(
          <UserCollection
            authorId={authorId}
            id={id}
            key={id}
            name={name}
            numberOfAddons={numberOfAddons}
            slug={slug}
          />,
        );
      });
    } else {
      // Create 4 "loading" components.
      for (let count = 0; count < 4; count++) {
        collectionElements.push(
          <UserCollection id={count} key={count} loading />,
        );
      }
    }

    const footer = collectionElements.length ? null : noCollectionsText;

    return (
      <CardList
        className="CollectionList-list"
        footer={footer}
        header={i18n.gettext('My collections')}
      >
        {collectionElements.length && (
          <ul className="CollectionList-listing">{collectionElements}</ul>
        )}
      </CardList>
    );
  }

  render() {
    const { i18n, isLoggedIn } = this.props;

    return (
      <div className="CollectionList">
        <div className="CollectionList-wrapper">
          <Card
            className="CollectionList-info"
            header={i18n.gettext('Collections')}
          >
            {!isLoggedIn ? (
              <AuthenticateButton
                noIcon
                logInText={i18n.gettext('Log in to view your collections')}
              />
            ) : (
              <>
                <p className="CollectionList-info-text">
                  {i18n.gettext(`Collections make it easy to keep track of
                    favorite add-ons and share your perfectly customized browser
                    with others.`)}
                </p>
                <Button
                  buttonType="action"
                  className="CollectionList-create"
                  puffy
                  to="/collections/add/"
                >
                  {i18n.gettext('Create a collection')}
                </Button>
              </>
            )}
          </Card>
          {isLoggedIn ? this.renderCollections() : null}
        </div>
      </div>
    );
  }
}

export const mapStateToProps = (state: AppState) => {
  const { collections, users } = state;

  const currentUser = getCurrentUser(users);
  const currentUserId = currentUser && currentUser.id;

  let userCollections;

  if (currentUserId) {
    userCollections = collections.userCollections[currentUserId];
  }

  return {
    currentUserId,
    isLoggedIn: !!currentUser,
    loadingUserCollections: userCollections ? userCollections.loading : false,
    collections: expandCollections(collections, userCollections),
  };
};

export const extractId = (ownProps: InternalProps) => {
  const { currentUserId } = ownProps;
  return currentUserId || '';
};

const CollectionList: React.ComponentType<Props> = compose(
  connect(mapStateToProps),
  translate(),
  withFixedErrorHandler({ fileName: __filename, extractId }),
)(CollectionListBase);

export default CollectionList;

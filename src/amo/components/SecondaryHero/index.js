/* @flow */
import invariant from 'invariant';
import * as React from 'react';

import Link from 'amo/components/Link';
import { addParamsToHeroURL, checkInternalURL } from 'amo/utils';
import tracking from 'core/tracking';
import type {
  HeroCallToActionType,
  SecondaryHeroShelfType,
} from 'amo/reducers/home';

import './styles.scss';

export const SECONDARY_HERO_CLICK_CATEGORY = 'AMO Secondary Hero Clicks';
export const SECONDARY_HERO_SRC = 'homepage-secondary-hero';

type Props = {| shelfData: SecondaryHeroShelfType |};

type InternalProps = {|
  ...Props,
  _checkInternalURL: typeof checkInternalURL,
  _tracking: typeof tracking,
|};

const makeCallToActionURL = (urlString: string) => {
  return addParamsToHeroURL({ heroSrcCode: SECONDARY_HERO_SRC, urlString });
};

export const SecondaryHeroBase = ({
  _checkInternalURL = checkInternalURL,
  _tracking = tracking,
  shelfData,
}: InternalProps) => {
  const { headline, description, cta, modules } = shelfData;

  invariant(headline, 'The headline property is required');
  invariant(description, 'The description property is required');
  invariant(modules, 'The modules property is required');

  const onHeroClick = (event: SyntheticEvent<HTMLAnchorElement>) => {
    _tracking.sendEvent({
      action: event.currentTarget.href,
      category: SECONDARY_HERO_CLICK_CATEGORY,
    });
  };

  const getLinkProps = (link: HeroCallToActionType | null) => {
    const props = { onClick: onHeroClick };
    if (link) {
      const urlInfo = _checkInternalURL({ urlString: link.url });
      if (urlInfo.isInternal) {
        return { ...props, to: makeCallToActionURL(urlInfo.relativeURL) };
      }
      return {
        ...props,
        href: makeCallToActionURL(link.url),
        prependClientApp: false,
        prependLang: false,
        target: '_blank',
      };
    }
    return {};
  };

  const renderedModules = [];
  modules.forEach((module) => {
    renderedModules.push(
      <div className="SecondaryHero-module" key={module.description}>
        <img
          alt={module.description}
          className="SecondaryHero-module-icon"
          src={module.icon}
        />
        <div className="SecondaryHero-module-description">
          {module.description}
        </div>
        {module.cta && (
          <Link
            className="SecondaryHero-module-link"
            {...getLinkProps(module.cta)}
          >
            <span className="SecondaryHero-module-linkText">
              {module.cta.text}
            </span>
          </Link>
        )}
      </div>,
    );
  });

  return (
    <section className="SecondaryHero">
      <div className="SecondaryHero-message">
        <h2 className="SecondaryHero-message-headline">{headline}</h2>
        <div className="SecondaryHero-message-description">{description}</div>
        {cta && (
          <Link className="SecondaryHero-message-link" {...getLinkProps(cta)}>
            <span className="SecondaryHero-message-linkText">{cta.text}</span>
          </Link>
        )}
      </div>
      {renderedModules}
    </section>
  );
};

export default SecondaryHeroBase;

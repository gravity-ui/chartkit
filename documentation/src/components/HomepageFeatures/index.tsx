import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
    title: React.ReactNode;
    Svg: React.ComponentType<React.ComponentProps<'svg'>>;
    description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
    {
        title: <Translate id="home-page.feature-title-ecosystem" />,
        Svg: require('@site/static/img/feature-ecosystem.svg').default,
        description: (
            <Translate
                id="home-page.feature-description-ecosystem"
                values={{
                    gravityLink: <Link to="https://gravity-ui.com/">Gravity UI</Link>,
                }}
            />
        ),
    },
    {
        title: <Translate id="home-page.feature-title-opensource" />,
        Svg: require('@site/static/img/feature-opensource.svg').default,
        description: <Translate id="home-page.feature-description-opensource" />,
    },
    {
        title: <Translate id="home-page.feature-title-extendable" />,
        Svg: require('@site/static/img/feature-extendable.svg').default,
        description: <Translate id="home-page.feature-description-extendable" />,
    },
];

function Feature({title, Svg, description}: FeatureItem) {
    return (
        <div className={clsx('col col--4')}>
            <div>
                <Svg className={styles.featureSvg} role="img" />
            </div>
            <div className="padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): JSX.Element {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}

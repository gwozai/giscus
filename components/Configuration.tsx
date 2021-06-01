import { CheckIcon, ClippyIcon, SyncIcon, XIcon } from '@primer/octicons-react';
import { useEffect, useState } from 'react';
import { handleClipboardCopy } from '../lib/adapter';
import { useDebounce } from '../lib/hooks';
import { ICategory } from '../lib/types/adapter';
import { themeOptions } from '../lib/variables';
import { getCategories } from '../services/giscus/categories';

const mappingOptions = [
  {
    value: 'pathname',
    label: (
      <>
        Discussion title contains page <code>pathname</code>
      </>
    ),
    description: (
      <>
        giscus will search for a discussion whose title contains the {`page's `}
        <code>pathname</code> URL component.
      </>
    ),
  },
  {
    value: 'url',
    label: <>Discussion title contains page URL</>,
    description: <>giscus will search for a discussion whose title contains the {`page's`} URL.</>,
  },
  {
    value: 'title',
    label: (
      <>
        Discussion title contains page <code>{'<title>'}</code>
      </>
    ),
    description: (
      <>
        giscus will search for a discussion whose title contains the {`page's `}
        <code>{'<title>'}</code> HTML tag.
      </>
    ),
  },
  {
    value: 'og:title',
    label: (
      <>
        Discussion title contains page <code>og:title</code>
      </>
    ),
    description: (
      <>
        giscus will search for a discussion whose title contains the {`page's `}
        <a href="https://ogp.me" target="_blank" rel="noreferrer noopener nofollow">
          <code>{`<meta property="og:title">`}</code>
        </a>{' '}
        HTML tag.
      </>
    ),
  },
  {
    value: 'specific',
    label: <>Discussion title contains a specific term</>,
    description: <>giscus will search for a discussion whose title contains a specific term.</>,
  },
  {
    value: 'number',
    label: <>Specific discussion number</>,
    description: (
      <>
        giscus will load a specific discussion by number. This option <strong>does not</strong>{' '}
        support automatic discussion creation.
      </>
    ),
  },
];

function ClipboardCopy() {
  return (
    <div className="top-0 right-0 zeroclipboard-container position-absolute">
      <button
        aria-label="Copy"
        className="p-0 m-2 ClipboardButton btn js-clipboard-copy tooltipped-no-delay"
        data-copy-feedback="Copied!"
        tabIndex={0}
        role="button"
        onClick={handleClipboardCopy}
      >
        <ClippyIcon className="m-2 octicon octicon-clippy js-clipboard-clippy-icon" />
        <CheckIcon className="m-2 octicon octicon-check js-clipboard-check-icon color-text-success d-none" />
      </button>
    </div>
  );
}

interface DirectConfig {
  theme: string;
  reactionsEnabled: boolean;
}

interface ConfigurationProps {
  directConfig: DirectConfig;
  onDirectConfigChange: (key: keyof DirectConfig, value: DirectConfig[keyof DirectConfig]) => void;
}

export default function Configuration({ directConfig, onDirectConfigChange }: ConfigurationProps) {
  const [repository, setRepository] = useState('');
  const [repositoryId, setRepositoryId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [mapping, setMapping] = useState('pathname');
  const [term, setTerm] = useState('');
  const dRepository = useDebounce(repository);

  useEffect(() => {
    setError(false);
    setRepositoryId('');
    setCategoryId('');
    setCategories([]);
    if (dRepository) {
      getCategories(dRepository)
        .then(({ repositoryId, categories }) => {
          setRepositoryId(repositoryId);
          setCategories(categories);
        })
        .catch(() => {
          setError(true);
        });
    }
  }, [dRepository]);

  return (
    <div className="p-4 pt-0 markdown">
      <h2>configuration</h2>

      <h3>Repository</h3>
      <p>Choose the repository giscus will connect to.</p>
      <ol>
        <li>
          Make sure the repository is public, otherwise your visitors will not be able to view the
          discussion.
        </li>
        <li>
          Make sure the{' '}
          <a
            href="https://github.com/apps/giscus"
            target="_blank"
            rel="noreferrer noopener nofollow"
          >
            giscus
          </a>{' '}
          app is installed on the repository, otherwise visitors will not be able to post comments
          and replies.
        </li>
        <li>
          Make sure the Discussions feature is turned <strong>on</strong> by enabling it in the
          settings tab of the repository.
        </li>
      </ol>
      <fieldset>
        <label htmlFor="repository" className="block font-semibold">
          repository:
        </label>
        <input
          id="repository"
          value={repository}
          onChange={(event) => setRepository(event.target.value)}
          type="text"
          className="my-2 px-[12px] py-[5px] min-w-[75%] sm:min-w-[50%] form-control border rounded-md placeholder-gray-500"
          placeholder="owner/repo"
        />

        {error || (repositoryId && !categories.length) ? (
          <>
            <XIcon className="inline-block ml-2 color-text-danger" />
            <p className="text-xs color-text-danger">
              Cannot use giscus in this repository. Make sure all of the above criteria has been
              met.
            </p>
          </>
        ) : repositoryId && categories.length ? (
          <>
            <CheckIcon className="inline-block ml-2 color-text-success" />
            <p className="text-xs color-text-success">
              Success! This repository meets all of the above criteria.
            </p>
          </>
        ) : (
          <>
            {!error && !repositoryId && dRepository ? (
              <SyncIcon className="inline-block ml-2 animate-spin" />
            ) : null}
            <p className="text-xs color-text-secondary">
              A <strong>public</strong> GitHub repository. This is where the discussions will be
              linked to.
            </p>
          </>
        )}
      </fieldset>

      <h3>Discussion Category</h3>
      <p>Choose the discussion category where new discussions will be created.</p>
      <select
        name="category"
        id="category"
        disabled={!categories.length}
        value={categoryId}
        onChange={(event) => setCategoryId(event.target.value)}
        className={`px-[12px] py-[5px] pr-6 min-w-[200px] border rounded-md appearance-none bg-no-repeat form-control form-select color-border-primary color-bg-primary${
          !categoryId ? ' color-text-secondary' : ''
        }`}
      >
        <option value="" disabled selected={!categoryId}>
          {categories.length ? 'Pick a category' : 'No categories found'}
        </option>
        {categories.map(({ id, emoji, name }) => (
          <option key={id} value={id} className="color-text-primary">
            {emoji} {name}
          </option>
        ))}
      </select>

      <h3>Page ↔️ Discussions Mapping</h3>
      <p>Choose the mapping between the embedding page and the embedded discussion.</p>
      <fieldset>
        {mappingOptions.map(({ value, label, description }) => (
          <div key={value} className="mt-4 first:mt-0 form-checkbox">
            <input
              id={value}
              className="mt-[3.5px]"
              type="radio"
              name="mapping"
              value={value}
              checked={mapping === value}
              onChange={(event) => {
                setTerm('');
                setMapping(event.target.value);
              }}
            />
            <label className="cursor-pointer" htmlFor={value}>
              <strong>{label}</strong>
            </label>
            <p className="mb-0 text-xs color-text-secondary">{description}</p>
            {['specific', 'number'].includes(mapping) && mapping === value ? (
              <input
                id="term"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                type={mapping === 'number' ? 'number' : 'text'}
                className="px-[12px] py-[5px] mt-4 form-control border rounded-md placeholder-gray-500 min-w-[75%] sm:min-w-[50%]"
                placeholder={
                  mapping === 'number' ? 'Enter discussion number here' : 'Enter term here'
                }
              />
            ) : null}
          </div>
        ))}
      </fieldset>

      <h3>Features</h3>
      <p>Choose whether specific features should be enabled.</p>
      <div className="form-checkbox">
        <input
          type="checkbox"
          id="reactionsEnabled"
          checked={directConfig.reactionsEnabled}
          value={`${+directConfig.reactionsEnabled}`}
          onChange={(event) => onDirectConfigChange('reactionsEnabled', event.target.checked)}
        ></input>
        <label htmlFor="reactionsEnabled">
          <strong>Enable reactions for the main post</strong>
        </label>
        <p className="mb-0 text-xs color-text-secondary">
          The reactions for the {`discussion's`} main post will be shown before the comments.
        </p>
      </div>

      <h3>Theme</h3>
      <p>
        Choose a theme that matches your website. {`Can't`} find one that does?{' '}
        <a
          href="https://github.com/laymonage/giscus/blob/main/CONTRIBUTING.md#creating-new-themes"
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          Contribute
        </a>{' '}
        a custom theme.
      </p>
      <select
        name="theme"
        id="theme"
        value={directConfig.theme}
        onChange={(event) => onDirectConfigChange('theme', event.target.value)}
        className="px-[12px] py-[5px] pr-6 border rounded-md appearance-none bg-no-repeat form-control form-select color-border-primary color-bg-primary"
      >
        {themeOptions.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <h3>Enable giscus</h3>
      <p>
        Add the following <code>{'<script>'}</code> tag to your {`website's`} template where you
        want the comments to appear. If an element with the class <code>giscus</code> exists, the
        comments will be placed there instead.
      </p>
      <div className="relative highlight highlight-text-html-basic">
        <pre>
          <span className="pl-kos">{'<'}</span>
          <span className="pl-ent">script</span> <span className="pl-c1">src</span>={'"'}
          <span className="pl-s">https://giscus.app/client.js</span>
          {'"\n        '}
          <span className="pl-c1">data-repo</span>={'"'}
          <span className="pl-s">{repository || '[ENTER REPO HERE]'}</span>
          {'"\n        '}
          <span className="pl-c1">data-repo-id</span>={'"'}
          <span className="pl-s">{repositoryId || '[ENTER REPO ID HERE]'}</span>
          {'"\n        '}
          <span className="pl-c1">data-category-id</span>={'"'}
          <span className="pl-s">{categoryId || '[ENTER CATEGORY ID HERE]'}</span>
          {'"\n        '}
          <span className="pl-c1">data-mapping</span>={'"'}
          <span className="pl-s">{mapping}</span>
          {'"\n        '}
          {['specific', 'number'].includes(mapping) ? (
            <>
              <span className="pl-c1">data-term</span>={'"'}
              <span className="pl-s">{term || '[ENTER TERM HERE]'}</span>
              {'"\n        '}
            </>
          ) : null}
          <span className="pl-c1">data-reactions-enabled</span>={'"'}
          <span className="pl-s">{Number(directConfig.reactionsEnabled)}</span>
          {'"\n        '}
          <span className="pl-c1">data-theme</span>={'"'}
          <span className="pl-s">{directConfig.theme}</span>
          {'"\n        '}
          <span className="pl-c1">crossorigin</span>={'"'}
          <span className="pl-s">anonymous</span>
          {'"\n        '}
          <span className="pl-c1">async</span>
          <span className="pl-kos">{'>'}</span>
          {'\n'}
          <span className="pl-kos">{'<'}/</span>
          <span className="pl-ent">script</span>
          <span className="pl-kos">{'>'}</span>
        </pre>
        <ClipboardCopy />
      </div>
      <p>
        You can customize the layout using the <code>.giscus</code> and <code>.giscus-frame</code>{' '}
        selectors. For example, you can add the following rules to your CSS file.
      </p>
      <div className="relative highlight highlight-source-css">
        <pre>
          .<span className="pl-c1">giscus</span>
          <span className="pl-kos">,</span> .<span className="pl-c1">giscus-frame</span> {'{\n  '}
          <span className="pl-c1">width</span>
          <span className="pl-kos">:</span>{' '}
          <span className="pl-c1">
            100<span className="pl-smi">%</span>
          </span>
          ;{'\n}\n\n'}.<span className="pl-c1">giscus-frame</span> {'{\n  '}
          <span className="pl-c1">border</span>
          <span className="pl-kos">:</span> none;
          {'\n}'}
        </pre>
        <ClipboardCopy />
      </div>
    </div>
  );
}

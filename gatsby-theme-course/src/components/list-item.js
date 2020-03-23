/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Link } from 'gatsby';

const ListItem = ({ title, slug, number, description }) => {
	return (
		<li>
			<Link to={slug}>
				<h3>
					{number}: {title}
				</h3>
			</Link>
			<p>{description}</p>
		</li>
	);
};

export default ListItem;

/** @jsx jsx */
import { jsx } from 'theme-ui';
import ListItem from './list-item';

const List = ({ items }) => {
	return (
		<ul>
			{items.map(item => (
				<ListItem
					key={item.title}
					title={item.title}
					slug={item.slug}
					number={item.number}
					description={item.description}
				/>
			))}
		</ul>
	);
};

export default List;

import { graphql } from 'gatsby';
import ModulePage from '../components/module';

export default ModulePage;

export const query = graphql`
	query ModulePageQuery($id: String!, $previousId: String, $nextId: String, $module: Int!) {
		site {
			siteMetadata {
				title
			}
		}
		mdxCourse {
			title
			description
		}
		mdxModule(id: { eq: $id }) {
			id
			slug
			title
			body
			module
		}
		previous: mdxModule(id: { eq: $previousId }) {
			id
			slug
			title
			module
		}
		next: mdxModule(id: { eq: $nextId }) {
			id
			slug
			title
			module
		}
		lessons: allMdxLesson(filter: { module: { eq: $module } }, sort: { fields: lesson }) {
			edges {
				node {
					title
					slug
					lesson
				}
			}
		}
	}
`;

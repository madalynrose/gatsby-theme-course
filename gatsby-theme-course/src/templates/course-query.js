import { graphql } from 'gatsby';
import CoursePage from '../components/course';

export default CoursePage;

export const query = graphql`
	query CourseQuery {
		site {
			siteMetadata {
				title
			}
		}
		mdxCourse {
			title
			body
			description
		}
		allMdxModule(sort: { fields: module, order: ASC }) {
			edges {
				node {
					id
					module
					slug
					title
				}
			}
		}
	}
`;

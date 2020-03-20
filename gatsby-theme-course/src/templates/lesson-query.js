import { graphql } from 'gatsby';
import LessonPage from '../components/lesson';

export default LessonPage;

export const query = graphql`
	query LessonPageQuery($id: String!, $previousId: String, $nextId: String) {
		site {
			siteMetadata {
				title
			}
		}
		mdxCourse {
			title
			description
		}
		mdxLesson(id: { eq: $id }) {
			id
			slug
			title
			module
			lesson
			body
		}
		previous: mdxLesson(id: { eq: $previousId }) {
			id
			slug
			title
			module
			lesson
		}
		next: mdxLesson(id: { eq: $nextId }) {
			id
			slug
			title
			module
			lesson
		}
	}
`;

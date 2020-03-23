import React from 'react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import Layout from './layout';
import List from './list';

const Course = ({ data: { course, modules } }) => {
	return (
		<Layout>
			<h1>{course.title}</h1>
			<MDXRenderer>{course.body}</MDXRenderer>
			<h2>List of modules:</h2>
			<List items={modules.nodes} />
		</Layout>
	);
};

export default Course;

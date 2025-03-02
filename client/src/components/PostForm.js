import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const PostForm = ({ initialValues, onSubmit, isEdit = false }) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [schedulePost, setSchedulePost] = useState(!!initialValues.scheduledAt);

  // Validation schema
  const validationSchema = Yup.object({
    content: Yup.string()
      .required('Content is required')
      .max(3000, 'Content must be less than 3000 characters'),
    mediaUrls: Yup.array().of(Yup.string().url('Must be a valid URL')),
    platforms: Yup.array().of(Yup.string()).min(1, 'Select at least one platform'),
    scheduledAt: Yup.date().nullable().when('schedule', {
      is: true,
      then: Yup.date()
        .min(new Date(), 'Scheduled time must be in the future')
        .required('Scheduled time is required'),
    }),
  });

  // Quill editor modules
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  // Quill editor formats
  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'link',
    'image',
  ];

  // Handle media URL input
  const handleAddMediaUrl = (values, setFieldValue) => {
    const mediaUrls = [...values.mediaUrls, ''];
    setFieldValue('mediaUrls', mediaUrls);
  };

  const handleRemoveMediaUrl = (index, values, setFieldValue) => {
    const mediaUrls = [...values.mediaUrls];
    mediaUrls.splice(index, 1);
    setFieldValue('mediaUrls', mediaUrls);
  };

  return (
    <Formik
      initialValues={{
        content: initialValues.content || '',
        mediaUrls: initialValues.mediaUrls || [],
        platforms: initialValues.platforms || ['linkedin'],
        scheduledAt: initialValues.scheduledAt ? new Date(initialValues.scheduledAt) : null,
        schedule: !!initialValues.scheduledAt,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        // If not scheduling, set scheduledAt to null
        if (!schedulePost) {
          values.scheduledAt = null;
        }
        onSubmit(values);
      }}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => (
        <Form className="space-y-6">
          {/* Toggle between edit and preview */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  !previewMode
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setPreviewMode(false)}
              >
                Edit
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  previewMode
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setPreviewMode(true)}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Content editor/preview */}
          <div className="space-y-2">
            <label htmlFor="content" className="form-label">
              Post Content
            </label>
            {previewMode ? (
              <div className="border border-gray-300 rounded-md p-4 min-h-[200px] bg-white">
                <div dangerouslySetInnerHTML={{ __html: values.content }} />
              </div>
            ) : (
              <>
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={formats}
                  value={values.content}
                  onChange={(content) => setFieldValue('content', content)}
                />
                {errors.content && touched.content && (
                  <div className="error-message">{errors.content}</div>
                )}
              </>
            )}
          </div>

          {/* Media URLs */}
          <div className="space-y-2">
            <label className="form-label">Media URLs</label>
            <div className="space-y-2">
              {values.mediaUrls.map((url, index) => (
                <div key={index} className="flex space-x-2">
                  <Field
                    name={`mediaUrls[${index}]`}
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMediaUrl(index, values, setFieldValue)}
                    className="btn btn-secondary"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddMediaUrl(values, setFieldValue)}
                className="btn btn-secondary"
              >
                Add Media URL
              </button>
            </div>
          </div>

          {/* Platforms */}
          <div className="space-y-2">
            <label className="form-label">Platforms</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <Field
                  type="checkbox"
                  name="platforms"
                  value="linkedin"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="linkedin" className="ml-2 block text-sm text-gray-900">
                  LinkedIn
                </label>
              </div>
              {errors.platforms && touched.platforms && (
                <div className="error-message">{errors.platforms}</div>
              )}
            </div>
          </div>

          {/* Schedule toggle */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="schedule"
                checked={schedulePost}
                onChange={() => setSchedulePost(!schedulePost)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="schedule" className="ml-2 block text-sm text-gray-900">
                Schedule this post
              </label>
            </div>
          </div>

          {/* Schedule date/time picker */}
          {schedulePost && (
            <div className="space-y-2">
              <label htmlFor="scheduledAt" className="form-label">
                Schedule Date & Time
              </label>
              <DatePicker
                selected={values.scheduledAt}
                onChange={(date) => setFieldValue('scheduledAt', date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="input"
                placeholderText="Select date and time"
              />
              {errors.scheduledAt && touched.scheduledAt && (
                <div className="error-message">{errors.scheduledAt}</div>
              )}
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="submit"
              name="action"
              value="draft"
              disabled={isSubmitting}
              className="btn btn-secondary"
              onClick={() => {
                setFieldValue('scheduledAt', null);
                setSchedulePost(false);
              }}
            >
              Save as Draft
            </button>
            {schedulePost ? (
              <button
                type="submit"
                name="action"
                value="schedule"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isEdit ? 'Update Schedule' : 'Schedule Post'}
              </button>
            ) : (
              <button
                type="submit"
                name="action"
                value="publish"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                Publish Now
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

PostForm.propTypes = {
  initialValues: PropTypes.shape({
    content: PropTypes.string,
    mediaUrls: PropTypes.arrayOf(PropTypes.string),
    platforms: PropTypes.arrayOf(PropTypes.string),
    scheduledAt: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
};

export default PostForm;